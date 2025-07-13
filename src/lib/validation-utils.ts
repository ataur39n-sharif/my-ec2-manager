/**
 * Validation utilities for user information
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validate username
 * @param username - The username to validate
 * @returns ValidationResult
 */
export function validateUsername(username: string): ValidationResult {
    const errors: string[] = [];

    if (!username.trim()) {
        errors.push('Username is required');
    } else {
        if (username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (username.length > 50) {
            errors.push('Username must be less than 50 characters');
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, underscores, and hyphens');
        }

        if (/^[0-9_-]/.test(username)) {
            errors.push('Username must start with a letter');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate email address
 * @param email - The email to validate
 * @returns ValidationResult
 */
export function validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email.trim()) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }

        if (email.length > 254) {
            errors.push('Email must be less than 254 characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate password with configurable requirements
 * @param password - The password to validate
 * @param options - Validation options
 * @returns ValidationResult
 */
export function validatePassword(
    password: string,
    options: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
    } = {}
): ValidationResult {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true
    } = options;

    const errors: string[] = [];

    if (!password) {
        errors.push('Password is required');
    } else {
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }

        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate EC2 secret
 * @param secret - The secret to validate
 * @returns ValidationResult
 */
export function validateEC2Secret(secret: string): ValidationResult {
    const errors: string[] = [];

    if (!secret) {
        errors.push('EC2 secret is required');
    } else {
        if (secret.length !== 6) {
            errors.push('EC2 secret must be exactly 6 characters long');
        }

        if (!/^[0-9]+$/.test(secret)) {
            errors.push('EC2 secret must contain only numbers');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate AWS credentials
 * @param credentials - The credentials object to validate
 * @returns ValidationResult
 */
export function validateAWSCredentials(credentials: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    profileName?: string;
}): ValidationResult {
    const errors: string[] = [];

    if (!credentials.accessKeyId?.trim()) {
        errors.push('AWS Access Key ID is required');
    } else if (!/^AKIA[0-9A-Z]{16}$/.test(credentials.accessKeyId)) {
        errors.push('Invalid AWS Access Key ID format');
    }

    if (!credentials.secretAccessKey?.trim()) {
        errors.push('AWS Secret Access Key is required');
    } else if (credentials.secretAccessKey.length !== 40) {
        errors.push('AWS Secret Access Key must be 40 characters long');
    }

    if (!credentials.region?.trim()) {
        errors.push('AWS Region is required');
    } else {
        const validRegions = [
            'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
            'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-northeast-1',
            'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2',
            'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
            'eu-west-3', 'eu-north-1', 'eu-south-1', 'me-south-1',
            'sa-east-1'
        ];
        if (!validRegions.includes(credentials.region)) {
            errors.push('Invalid AWS Region');
        }
    }

    if (credentials.profileName && credentials.profileName.length > 50) {
        errors.push('Profile name must be less than 50 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate user registration data
 * @param userData - The user data to validate
 * @returns ValidationResult
 */
export function validateUserRegistration(userData: {
    name?: string;
    email?: string;
    password?: string;
}): ValidationResult {
    const errors: string[] = [];

    // Validate name
    if (!userData.name?.trim()) {
        errors.push('Name is required');
    } else if (userData.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    } else if (userData.name.length > 100) {
        errors.push('Name must be less than 100 characters');
    }

    // Validate email
    const emailValidation = validateEmail(userData.email || '');
    if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
    }

    // Validate password
    const passwordValidation = validatePassword(userData.password || '');
    if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate settings form data
 * @param settingsData - The settings data to validate
 * @returns ValidationResult
 */
export function validateSettingsForm(settingsData: {
    username?: string;
    password?: string;
    ec2Secret?: string;
    ec2SecretEnabled?: boolean;
}): ValidationResult {
    const errors: string[] = [];

    // Validate username if provided
    if (settingsData.username !== undefined) {
        const usernameValidation = validateUsername(settingsData.username);
        if (!usernameValidation.isValid) {
            errors.push(...usernameValidation.errors);
        }
    }

    // Validate password if provided
    if (settingsData.password && settingsData.password.trim()) {
        const passwordValidation = validatePassword(settingsData.password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }
    }

    // Validate EC2 secret if enabled
    if (settingsData.ec2SecretEnabled && settingsData.ec2Secret !== undefined) {
        const secretValidation = validateEC2Secret(settingsData.ec2Secret);
        if (!secretValidation.isValid) {
            errors.push(...secretValidation.errors);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
} 