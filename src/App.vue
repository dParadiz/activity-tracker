<script setup>
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg bg-primary"  data-bs-theme="dark">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarColor02">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" :class="{ 'active': $route.path === '/setup' }" to="/setup">
                Setup
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :class="{ 'active': $route.path === '/track' }" to="/track">
                Tracking
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
.gap-4 {
  gap: 1.5rem;
}
</style>