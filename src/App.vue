<script setup>


</script>

<template>
  <div>
    <nav class="flex justify-center items-center">
      <ul class="flex gap-4">
        <li>
          <router-link class="hover:text-blue-500 transition-colors duration-200"
                       :class="{ 'text-blue-500': $route.path === '/setup' }" to="/setup">Setup
          </router-link>
        </li>
        <li>
          <router-link class="hover:text-blue-500 transition-colors duration-200"
                       :class="{ 'text-blue-500': $route.path === '/track' }" to="/track">Tracking
          </router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>
