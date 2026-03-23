import { pathsToModuleNameMapper } from 'ts-jest';

interface TsConfig {
  compilerOptions: {
    paths?: Record<string, string[]>;
  };
}

import tsConfig from './tsconfig.json';
const compilerOptions = (tsConfig as TsConfig).compilerOptions;

export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions?.paths ?? {}, {
    prefix: '<rootDir>/',
  }),
};
