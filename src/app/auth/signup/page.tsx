"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validation';
import { registerUser } from '@/lib/api';

const SignUp = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data);
            router.push('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('Something went wrong');
            }
        }
    };

    return (
        <div className="min-h-screen text-white flex items-center justify-center relative bg-gradient-to-r from-blue-800 to-black" >
            <div
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
                style={{ backgroundImage: 'url(/signup-bg.jpg)' }}
            ></div>
            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Phone Tracking App</h1>
                    <div className="flex justify-center mt-2">
                        <div className="w-2/3 bg-gray-700 h-1.5 rounded-full">
                            <div
                                className="bg-gradient-to-r from-pink-600 to-purple-600 h-1.5 rounded-full"
                                style={{ width: '25%' }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="bg-pink-600 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-center mb-4 text-white">Create account</h2>
                    <p className="text-center text-gray-200 mb-6">
                        Once you're set up, just log in from any device and see what they're up to.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                {...register('fullName')}
                                className={`w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white ${errors.fullName ? 'border-red-500' : ''
                                    }`}
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                {...register('email')}
                                className={`w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white ${errors.email ? 'border-red-500' : ''
                                    }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Password"
                                {...register('password')}
                                className={`w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white ${errors.password ? 'border-red-500' : ''
                                    }`}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-gray-700 text-white p-3 rounded-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
                                }`}
                        >
                            {isSubmitting ? 'Creating Account...' : 'CONTINUE'}
                        </button>
                    </form>
                    <div className="text-center mt-4 text-sm text-gray-400">
                        <p>
                            Already have an account?{' '}
                            <a href="/auth/login" className="text-purple-400 hover:underline">
                                Login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;