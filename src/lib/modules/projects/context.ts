import { createContext } from 'svelte';
import type { ProjectsModuleAPI } from './api';

// createContext provides typed get/set helpers without string keys
export const [getProjectsContext, setProjectsContext] = createContext<ProjectsModuleAPI>();
