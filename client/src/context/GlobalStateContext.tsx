import React, { 
    createContext, 
    useContext, 
    useReducer, 
    Dispatch 
  } from 'react';
  
  // Define types for different state slices
  interface UserState {
    profile: any;
    preferences: Record<string, any>;
  }
  
  interface AppState {
    theme: 'light' | 'dark';
    language: string;
    notifications: any[];
  }
  
  interface GlobalState {
    user: UserState;
    app: AppState;
  }
  
  // Action Types
  type ActionType = 
    | { type: 'SET_USER_PROFILE', payload: any }
    | { type: 'UPDATE_USER_PREFERENCES', payload: Record<string, any> }
    | { type: 'TOGGLE_THEME' }
    | { type: 'SET_LANGUAGE', payload: string }
    | { type: 'ADD_NOTIFICATION', payload: any }
    | { type: 'REMOVE_NOTIFICATION', payload: string };
  
  // Initial State
  const initialState: GlobalState = {
    user: {
      profile: null,
      preferences: {}
    },
    app: {
      theme: 'light',
      language: 'en',
      notifications: []
    }
  };
  
  // Reducer Function
  function globalReducer(state: GlobalState, action: ActionType): GlobalState {
    switch (action.type) {
      case 'SET_USER_PROFILE':
        return {
          ...state,
          user: { ...state.user, profile: action.payload }
        };
      case 'UPDATE_USER_PREFERENCES':
        return {
          ...state,
          user: { 
            ...state.user, 
            preferences: {
              ...state.user.preferences,
              ...action.payload 
            }
          }
        };
      case 'TOGGLE_THEME':
        return {
          ...state,
          app: {
            ...state.app,
            theme: state.app.theme === 'light' ? 'dark' : 'light'
          }
        };
      case 'SET_LANGUAGE':
        return {
          ...state,
          app: { ...state.app, language: action.payload }
        };
      case 'ADD_NOTIFICATION':
        return {
          ...state,
          app: {
            ...state.app,
            notifications: [...state.app.notifications, action.payload]
          }
        };
      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          app: {
            ...state.app,
            notifications: state.app.notifications.filter(
              n => n.id !== action.payload
            )
          }
        };
      default:
        return state;
    }
  }
  
  // Context and Provider
  const GlobalStateContext = createContext<{
    state: GlobalState;
    dispatch: Dispatch<ActionType>;
  } | undefined>(undefined);
  
  export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ 
    children 
  }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);
  
    return (
      <GlobalStateContext.Provider value={{ state, dispatch }}>
        {children}
      </GlobalStateContext.Provider>
    );
  };
  
  // Custom Hook for using Global State
  export function useGlobalState() {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
      throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
  }