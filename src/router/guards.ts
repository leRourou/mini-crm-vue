import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const publicRoutes = ["login"];

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void => {
  const authStore = useAuthStore();
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
};
