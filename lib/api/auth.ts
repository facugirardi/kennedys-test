import { fetchAPI, mutateAPI } from './fetcher'

interface LoginResponse {
    success?: boolean;
    message?: string;
    data: {
        token: string;
        user?: any; // Ajusta este tipo según la respuesta de tu API
        account?: any; // Shape returned by /auth/agent-portfolio/login (AgentPortfolioAccount)
    }
}

export async function registerUser(userData: any) {
    return mutateAPI('/auth/register', 'POST', userData);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    // Usar el endpoint de login para clientes del website
    return mutateAPI('/auth/login/client', 'POST', { email, password });
}

/** B2B Agent Portfolio accounts — a completely separate backend table/login from the website's
 * User model (see kennedys-api's agentPortfolioAuthService.ts). */
export async function agentLogin(email: string, password: string): Promise<LoginResponse> {
    return mutateAPI('/auth/agent-portfolio/login', 'POST', { email, password });
}

export async function agentForgotPassword(email: string) {
    return mutateAPI('/auth/agent-portfolio/forgot-password', 'POST', { email });
}

export async function agentResetPassword(token: string, password: string) {
    return mutateAPI('/auth/agent-portfolio/reset-password', 'POST', { token, password });
}

export async function verifyCode(userData: { email: string; code: string }) {
    const q = new URLSearchParams({
        email: userData.email,
        verifyCode: userData.code,
    });
    return fetchAPI(`/auth/verify?${q.toString()}`);
}

export async function resendVerificationCode(userData: { email: string }) {
    return mutateAPI('/auth/resend', 'POST', { email: userData.email });
}

export async function forgotPassword(email: string) {
    return mutateAPI('/auth/forgot-password', 'POST', { email });
}

export async function resetPassword(token: string, password: string) {
    return mutateAPI('/auth/reset-password', 'POST', { token, password });
}

export async function requestEmailChange(newEmail: string) {
    return mutateAPI('/auth/change-email/request', 'POST', { newEmail });
}

export async function confirmEmailChange(token: string) {
    return mutateAPI('/auth/change-email/confirm', 'POST', { token });
}

export async function googleLogin(accessToken: string): Promise<LoginResponse> {
    return mutateAPI('/auth/google', 'POST', { accessToken });
}

// Función para obtener los datos del usuario usando el token
export async function getCurrentUser(token: string) {
    // Implementa esta función según tu API
    // Ejemplo:
    // return fetchAPI('/auth/me', 'GET', null, {
    //   'Authorization': `Bearer ${token}`
    // });
    return null;
}
