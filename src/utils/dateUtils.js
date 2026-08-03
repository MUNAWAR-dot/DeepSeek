import { format, formatDistance, formatRelative, isToday, isYesterday, differenceInHours, differenceInMinutes } from 'date-fns';

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp?.toDate?.() || new Date(timestamp);
  const now = new Date();
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  } else if (differenceInHours(now, date) < 168) { // Within a week
    return format(date, 'EEEE h:mm a');
  } else {
    return format(date, 'dd/MM/yyyy h:mm a');
  }
};

export const formatLastSeen = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp?.toDate?.() || new Date(timestamp);
  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;
  
  if (isYesterday(date)) return 'yesterday';
  
  return format(date, 'dd/MM/yyyy');
};

export const formatCallDuration = (seconds) => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const isSameDay = (date1, date2) => {
  const d1 = date1?.toDate?.() || new Date(date1);
  const d2 = date2?.toDate?.() || new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getRelativeTime = (timestamp) => {
  const date = timestamp?.toDate?.() || new Date(timestamp);
  return formatRelative(date, new Date());
};

export const formatDate = (timestamp, formatStr = 'dd/MM/yyyy') => {
  if (!timestamp) return '';
  const date = timestamp?.toDate?.() || new Date(timestamp);
  return format(date, formatStr);
};

export const getTimeAgo = (timestamp) => {
  const date = timestamp?.toDate?.() || new Date(timestamp);
  return formatDistance(date, new Date(), { addSuffix: true });
};
