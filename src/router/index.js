import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../components/dashboard/Dashboard.vue'),
    meta: { title: '工作台总览' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../components/chat/ChatWindow.vue'),
    meta: { title: 'AI 对话' }
  },
  {
    path: '/chat/:sessionId',
    name: 'chat-session',
    component: () => import('../components/chat/ChatWindow.vue'),
    meta: { title: 'AI 对话' }
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('../components/knowledge/KbDetail.vue'),
    meta: { title: '知识库' }
  },
  {
    path: '/knowledge/:kbId',
    name: 'knowledge-detail',
    component: () => import('../components/knowledge/KbDetail.vue'),
    meta: { title: '知识库详情' }
  },
  {
    path: '/creation',
    name: 'creation',
    component: () => import('../components/creation/CreationPanel.vue'),
    meta: { title: '文本创作' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../components/user/PersonalCenter.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../components/tasks/TaskPanel.vue'),
    meta: { title: '任务管理' }
  },
  {
    path: '/debate',
    name: 'debate',
    component: () => import('../components/debate/DebateWindow.vue'),
    meta: { title: '多智能体辩论' }
  },
  {
    path: '/agent',
    name: 'agent',
    component: () => import('../components/agent/AgentWindow.vue'),
    meta: { title: 'AI 自主工作流' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
