type environtment = {
    DATABASE: string | undefined;
    APIKEY: string | undefined;
    API_BASE_URl: string | undefined;
    ACCESS_TOKEN_SECRET: string | undefined;
    REFRESH_TOKEN_SECRET: string | undefined;
};

interface IConfig {
    production: environtment;
    default: environtment;
}

const config = (env: keyof IConfig): environtment => {
    const configEnv: IConfig = {
        production: {
            DATABASE: process.env.MONGODB_URI,
            APIKEY: process.env.API_KEY,
            API_BASE_URl: process.env.API_BASE_URl,
            ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
            REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        },
        default: {
            // DATABASE: 'mongodb://localhost:27017/libraryapp',
            // DATABASE: 'mongodb://localhost:27021/libraryapp?directConnection=true',
            DATABASE: 'mongodb://root:root@192.168.43.229:27017/libraryapp?directConnection=true&authSource=admin',
            APIKEY: process.env.API_KEY,
            API_BASE_URl: 'http://192.168.43.229:8082',
            ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
            REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        },
    };

    return configEnv[env] || configEnv.default;
};

export {IConfig};

export default config;
