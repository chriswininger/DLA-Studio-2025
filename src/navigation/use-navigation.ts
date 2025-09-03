import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { setCurrentTab, initializeFromStorage } from './navigation-slice';
import { navigationStorage } from './navigation-storage';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTab, isInitialized } = useAppSelector((state) => state.navigation);

  // Initialize navigation state from localStorage on first load
  useEffect(() => {
    if (!isInitialized) {
      const storedTab = navigationStorage.getStoredTab();
      dispatch(initializeFromStorage(storedTab));
      
      // Only redirect to stored tab if we're on the root path
      // This allows direct route access to work properly
      if (location.pathname === '/') {
        const targetTab = storedTab || '/about';
        navigate(targetTab, { replace: true });
      }
    }
  }, [dispatch, isInitialized, location.pathname, navigate]);

  // Update current tab when location changes
  useEffect(() => {
    if (isInitialized && location.pathname !== currentTab) {
      dispatch(setCurrentTab(location.pathname));
      navigationStorage.setStoredTab(location.pathname);
    }
  }, [dispatch, location.pathname, currentTab, isInitialized]);

  const navigateToTab = (tab: string) => {
    navigate(tab);
  };

  return {
    currentTab,
    isInitialized,
    navigateToTab,
  };
};
