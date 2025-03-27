import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { ENDPOINTS } from '../../constants/apiConstants';
import { MESSAGE_PRIORITY } from '../../constants/appConstants';

// Types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName?: string;
  content: string;
  timestamp: string;
  readStatus: boolean;
  priority: string; // urgent, high, normal, low
  category?: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

interface MessageState {
  messages: Record<string, Message>;
  conversations: Record<string, Conversation>;
  activeConversation: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: MessageState = {
  messages: {},
  conversations: {},
  activeConversation: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(ENDPOINTS.MESSAGES.GET_ALL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/conversations');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (message: Omit<Message, 'id' | 'timestamp' | 'readStatus'>, { rejectWithValue }) => {
    try {
      const response = await apiService.post(ENDPOINTS.MESSAGES.CREATE, message);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  },
  {
    // This action can be processed offline
    meta: {
      processOffline: true,
    },
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (messageId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post(ENDPOINTS.MESSAGES.MARK_READ.replace(':id', messageId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read');
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversation = action.payload;
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
    },
    addLocalMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      state.messages[message.id] = message;
      
      // Update conversation if it exists
      if (state.conversations[message.receiverId]) {
        state.conversations[message.receiverId].lastMessage = message;
        state.conversations[message.receiverId].unreadCount += 1;
      }
    },
    clearMessages: (state) => {
      state.messages = {};
      state.conversations = {};
      state.activeConversation = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loading = false;
      // Convert array to object with ID as key
      const messages = action.payload.reduce((acc: Record<string, Message>, message: Message) => {
        acc[message.id] = message;
        return acc;
      }, {});
      state.messages = messages;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.loading = false;
      // Convert array to object with ID as key
      const conversations = action.payload.reduce((acc: Record<string, Conversation>, conv: Conversation) => {
        acc[conv.id] = conv;
        return acc;
      }, {});
      state.conversations = conversations;
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false;
      const message = action.payload;
      state.messages[message.id] = message;
      
      // Update conversation
      if (state.conversations[message.receiverId]) {
        state.conversations[message.receiverId].lastMessage = message;
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Mark message as read
    builder.addCase(markMessageAsRead.fulfilled, (state, action) => {
      const messageId = action.payload.id;
      if (state.messages[messageId]) {
        state.messages[messageId].readStatus = true;
        
        // Update unread count in the conversation
        const conversationId = state.messages[messageId].senderId;
        if (state.conversations[conversationId]) {
          state.conversations[conversationId].unreadCount = 
            Math.max(0, state.conversations[conversationId].unreadCount - 1);
        }
      }
    });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  addLocalMessage,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
