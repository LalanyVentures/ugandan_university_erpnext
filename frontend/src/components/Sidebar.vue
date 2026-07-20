<template>
  <div class="flex h-full flex-col justify-between transition-all duration-300" :class="isCollapsed ? 'w-12' : 'w-56'">
    <div class="flex flex-col overflow-hidden">
      <UserDropdown class="p-2" :isCollapsed="isCollapsed" />
      <SidebarLink label="University Portal" to="/" :isCollapsed="isCollapsed" class="mx-2 my-0.5" />
    </div>
    <SidebarLink :label="isCollapsed ? 'Expand' : 'Collapse'" :isCollapsed="isCollapsed" @click="isCollapsed = !isCollapsed" class="m-2" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarLink from '@/components/SidebarLink.vue'
import UserDropdown from './UserDropdown.vue'

const isCollapsed = ref(false)
</script>
