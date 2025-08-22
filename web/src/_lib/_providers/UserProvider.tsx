'use client'

import React, { createContext, useContext, ReactNode } from 'react';

type User = {
    id: string;
    email?: string;
    emailVerified?: boolean;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    image?: string | null;
    is_admin?: boolean;
} | undefined;

interface UserContextType {
    user: User;
    setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
    initialUser?: User;
}

export function UserProvider({ children, initialUser }: UserProviderProps) {
    const [user, setUser] = React.useState<User>(initialUser);

    const value = {
        user,
        setUser,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 