import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.snapword.auth';

export const tokenStorage = {
    save: async (token: string) => {
        await Keychain.setGenericPassword('accessToken', token, { service: SERVICE });
    },
    load: async (): Promise<string | null> => {
        const credentials = await Keychain.getGenericPassword({ service: SERVICE });
        return credentials ? credentials.password : null;
    },
    clear: async () => {
        await Keychain.resetGenericPassword({ service: SERVICE });
    },
};
