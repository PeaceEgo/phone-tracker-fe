import { z } from 'zod';

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(5, 'Full name must be at least 2 characters')
        .max(50, 'Full name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
});

export type RegisterFormData = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
   password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
});
export type LoginFormData = z.infer<typeof loginSchema>;