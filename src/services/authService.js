const DEV_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYW50b3NoY2hhdml0aGluaTIwMDRAZ21haWwuY29tIiwidXNlcklkIjoxLCJyb2xlcyI6WyJST0xFX1NVUEVSX0FETUlOIl0sInBlcm1pc3Npb25zIjpbIioiXSwidGVuYW50RGIiOiJsbXNfdGVuYW50XzE3NzA3MDExMDEwODYiLCJpYXQiOjE3NzM0OTAwODR9.zQmLV4tuTHseJree70M-sG4W31ls-PXZCPFFuRGcMmxEevsuEeVpKJLgnQSZL7-JWeoMpARUN4zB0e-IGAHHoA";

export const authService = {
    login: async (email, password) => {
        console.log(`Checking connection to: /auth/login for user: ${email}`);
        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    username: email, // Fallback for backends expecting 'username'
                    password
                })
            });

            if (!res.ok) {
                const errorBody = await res.text();
                console.error('Login failed status:', res.status);
                console.error('Error Response Body:', errorBody);

                // DEVELOPMENT FALLBACK: If login fails but we have a dev token, allow it for specific email/pass
                if ((res.status === 401 || res.status === 403 || res.status === 404) && (email === 'admin@gmail.com' || email === 'santoshchavithini2004@gmail.com')) {
                    console.warn('⚠️ Login failed on server. Using DEVELOPMENT FALLBACK TOKEN.');
                    return { token: DEV_TOKEN, user: { email, role: 'ADMIN' } };
                }

                throw new Error(errorBody || `Login failed with status ${res.status}`);
            }

            // Backend returns the raw token string, not JSON
            const text = await res.text();
            console.log('Login successful, received token length:', text.length);
            try {
                return JSON.parse(text); 
            } catch (e) {
                return { token: text };
            }
        } catch (error) {
            console.error('Auth Service Error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
    }
};
