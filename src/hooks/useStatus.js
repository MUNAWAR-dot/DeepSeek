import { useState, useEffect, useCallback } from 'react';
import useStore from '../store/store';
import statusService from '../services/statusService';

export const useStatus = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    statuses,
    setStatuses,
    myStatuses,
    setMyStatuses,
    viewedStatuses,
    setViewedStatuses,
  } = useStore();

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const [feed, myStatus] = await Promise.all([
        statusService.getStatusFeed(),
        statusService.getMyStatuses(),
      ]);
      setStatuses(feed);
      setMyStatuses(myStatus);
    } catch (error) {
      console.error('Load statuses failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadStatuses();
    setRefreshing(false);
  }, [loadStatuses]);

  const createStatus = useCallback(async (mediaUri, type, caption) => {
    try {
      const status = await statusService.createStatus(mediaUri, type, caption);
      setMyStatuses([status, ...myStatuses]);
      return status;
    } catch (error) {
      console.error('Create status failed:', error);
      throw error;
    }
  }, [myStatuses]);

  const deleteStatus = useCallback(async (statusId) => {
    try {
      await statusService.deleteStatus(statusId);
      setMyStatuses(myStatuses.filter(s => s.id !== statusId));
    } catch (error) {
      console.error('Delete status failed:', error);
      throw error;
    }
  }, [myStatuses]);

  const viewStatus = useCallback(async (statusId) => {
    try {
      await statusService.viewStatus(statusId);
      setViewedStatuses([...new Set([...viewedStatuses, statusId])]);
    } catch (error) {
      console.error('View status failed:', error);
    }
  }, [viewedStatuses]);

  return {
    statuses,
    myStatuses,
    viewedStatuses,
    loading,
    refreshing,
    refresh,
    createStatus,
    deleteStatus,
    viewStatus,
  };
};
