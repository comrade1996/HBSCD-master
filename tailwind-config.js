tailwind.config = {
    theme: {
        extend: {
            colors: {
                'available': '#d1fae5',
                'engaged': '#fee2e2',
                'upcoming': '#ffedd5'
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }
        }
    }
};
