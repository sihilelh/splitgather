const COLORS = ['#1FD888','#e8a820','#3b82f6','#a78bfa','#f97316','#ec4899','#06b6d4']

// Helper to get initials from name
export function getInitials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Helper to get color for a user (consistent based on ID)
export function getColorForUser(userId) {
  return COLORS[userId % COLORS.length]
}
