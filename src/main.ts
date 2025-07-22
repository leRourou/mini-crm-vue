import "./assets/main.css";
import "./assets/vuetify-utilities.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import vuetify from "./plugins/vuetify";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);

// Move auth store initialization and router guard setup to after Pinia is registered
router.beforeEach(async (to, from, next) => {
  // Initialize auth store within the router guard (after Pinia is available)
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }

  const publicRoutes = ["login"];
  const isPublicRoute = publicRoutes.includes(to.name as string);

  if (authStore.isAuthenticated) {
    if (to.name === "login") {
      next({ name: "home" });
    } else {
      next();
    }
  } else {
    if (!isPublicRoute) {
      next({ name: "login" });
    } else {
      next();
    }
  }
});

app.mount("#app");
