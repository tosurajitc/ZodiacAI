// dateHelpers.js

const dateHelpers = {
  // Format date to readable string (e.g., "Dec 29, 2024")
  formatDate: (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  },

  // Format date to DD/MM/YYYY
  formatDateDDMMYYYY: (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  // Format time to 12-hour format (e.g., "2:30 PM")
  formatTime: (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  },

  // Format date and time together (e.g., "Dec 29, 2024 at 2:30 PM")
  formatDateTime: (date) => {
    const formattedDate = dateHelpers.formatDate(date);
    const formattedTime = dateHelpers.formatTime(date);
    return `${formattedDate} at ${formattedTime}`;
  },

  // Get relative time (e.g., "2 minutes ago", "3 hours ago")
  getRelativeTime: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return dateHelpers.formatDate(date);
    }
  },

  // Convert time string (HH:MM) to 12-hour format
  convertTo12Hour: (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  },

  // Get current date in YYYY-MM-DD format
  getCurrentDateYYYYMMDD: () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  },

  // Get age from birth date
  calculateAge: (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Get day of week (e.g., "Monday", "Tuesday")
  getDayOfWeek: (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
  },

  // Get month name (e.g., "January", "February")
  getMonthName: (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  },

  // Parse date from DD/MM/YYYY string
  parseDateDDMMYYYY: (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  },

  // Validate date string (YYYY-MM-DD)
  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },
};

export default dateHelpers;
