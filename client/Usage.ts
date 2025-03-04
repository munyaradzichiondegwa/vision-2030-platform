// Example of using global state
function UserProfile() {
    const { state, dispatch } = useGlobalState();
    
    const updateProfile = (profileData) => {
      dispatch({ 
        type: 'SET_USER_PROFILE', 
        payload: profileData 
      });
    };
  
    return (
      <div>
        {/* Component logic */}
      </div>
    );
  }