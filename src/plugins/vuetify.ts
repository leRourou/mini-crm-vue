import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#ff9800',
          background: '#f8fafc',
          surface: '#ffffff',
          'primary-darken-1': '#5a67d8',
          'secondary-darken-1': '#6b46c1',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#1f2937',
          'on-background': '#1f2937',
          'status-new': '#3b82f6',
          'status-progress': '#f59e0b',
          'status-completed': '#10b981',
          'status-cancelled': '#ef4444',
          'status-prospect': '#8b5cf6',
          'status-qualified': '#06b6d4',
          'status-won': '#22c55e',
          'status-lost': '#f43f5e',
        },
      },
      dark: {
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          background: '#0f172a',
          surface: '#1e293b',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#f1f5f9',
          'on-background': '#f1f5f9',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      elevation: 0,
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
    VDataTable: {
      elevation: 1,
      rounded: 'lg',
    },
  },
});
