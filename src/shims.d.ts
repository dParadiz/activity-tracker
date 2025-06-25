// Global type declarations for TypeScript

// Declare modules for file types that don't have TypeScript definitions
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declare global variables and interfaces
interface ImportMetaEnv {
  readonly VITE_APP_BASE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}