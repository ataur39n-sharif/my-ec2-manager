import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSettings } from "./dynamodb-config";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    // Get settings from DynamoDB (which contains username and password)
                    const settings = await getSettings();

                    if (!settings) {
                        console.log('No settings found - user needs to configure account first');
                        return null;
                    }

                    // Check if username matches
                    if (settings.username !== credentials.username) {
                        console.log('Username does not match');
                        return null;
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        settings.password
                    );

                    if (!isPasswordValid) {
                        console.log('Password is invalid');
                        return null;
                    }

                    // Return user data
                    return {
                        id: 'admin', // Single admin user
                        username: settings.username,
                        name: settings.username,
                        email: `${settings.username}@ec2-manager.local`, // Generate email for compatibility
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // After successful login, redirect to homepage
            if (url.startsWith(baseUrl)) {
                return `${baseUrl}/`;
            }
            // Allow relative callback URLs
            else if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }
            return baseUrl;
        },
    },
}; 