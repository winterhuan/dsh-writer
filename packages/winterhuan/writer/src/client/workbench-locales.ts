import type {} from '@deepseek-ai/dsh-client-ui-slots'

export const en = {
  projects: 'Works', libraries: 'Analysis library', scans: 'Market research', panels: 'Workbench panels',
  welcome: 'Your writing desk', workspaceHelp: 'Open a folder in the DSH workspace list to view your writing materials.',
  sessionHelp: 'Start a Writer conversation in this workspace to browse and edit its existing manuscripts, analysis, and research.',
  assistantHelp: 'Discuss your story, analyze a sample, or research the market in a Writer conversation.',
  newSession: 'New conversation', openConversation: 'Open conversation', retry: 'Retry', cancel: 'Cancel',
  createdSession: 'Writer conversation created', createdBook: 'Book created',
  title: 'Writer', navigation: 'Workbench sections', writerSession: 'Writer session', chooseWriterSession: 'Select a Writer session', workspace: 'Workspace', chooseWorkspace: 'Choose a workspace', bookTitle: 'Book title', folder: 'Book folder', form: 'Form', longForm: 'Long fiction', shortForm: 'Short fiction', createBook: 'Create book', document: 'Manuscript', assistant: 'Assistant', collapse: 'Collapse assistant', expand: 'Expand assistant',
  draftCheckpointFailed: 'The unsaved draft could not be protected. Keep this book open and save the manuscript before switching.',
  loadFailed: 'The workbench could not load', operationFailed: 'The operation could not be completed', create: 'Create', sessionUnavailable: 'This native session is unavailable',
  invalidBookPath: 'Choose a valid book folder', workspaceMissing: 'This workspace is unavailable', bookMissing: 'This book folder is unavailable', bookExists: 'This folder is already registered',
  sessionMissing: 'This native session is unavailable', sessionMismatch: 'This session belongs to another workspace', writerRequired: 'Choose a session using the Writer preset', sessionInUse: 'This session is linked to another book',
  sessionBusy: 'Stop the running session before starting a new phase', bindingNeedsRepair: 'The session link needs repair', invalidBookTitle: 'Enter a book title', filesUnavailable: 'File access is unavailable',
  untrustedRequest: 'The request was not trusted', requestTooLarge: 'The request is too large', invalidRequest: 'The request is invalid', workbenchFailed: 'The workbench operation failed',
}

export const zh = {
  projects: '作品', libraries: '拆文库', scans: '扫榜', panels: '工作台面板',
  welcome: '开始创作', workspaceHelp: '在 DSH 工作区列表中打开小说目录，即可查看写作资料',
  sessionHelp: '在当前工作区开启写作对话，即可浏览和编辑已有书稿、拆文资料与扫榜记录',
  assistantHelp: '在写作对话中讨论故事、拆解样文或调研市场',
  newSession: '新建对话', openConversation: '打开对话', retry: '重试', cancel: '取消',
  createdSession: '已创建写作对话', createdBook: '已创建作品',
  title: '小说创作工作台', navigation: '工作台分区', writerSession: '写作对话', chooseWriterSession: '选择写作对话', workspace: '工作区', chooseWorkspace: '选择工作区', bookTitle: '书名', folder: '书籍目录', form: '篇幅', longForm: '长篇小说', shortForm: '短篇小说', createBook: '创建作品', document: '正文', assistant: '助手', collapse: '收起助手', expand: '展开助手',
  draftCheckpointFailed: '未能保护当前草稿，请先保存文稿再切换',
  loadFailed: '工作台加载失败', operationFailed: '操作未能完成', create: '创建', sessionUnavailable: '原生会话不可用',
  invalidBookPath: '请选择有效的书籍目录', workspaceMissing: '工作区不可用', bookMissing: '书籍目录不可用', bookExists: '该目录已登记',
  sessionMissing: '原生会话不可用', sessionMismatch: '该会话不属于此工作区', writerRequired: '请选择使用 Writer 预设的会话', sessionInUse: '该会话已关联其他作品',
  sessionBusy: '请先停止运行中的会话，再创建新阶段', bindingNeedsRepair: '会话关联需要修复', invalidBookTitle: '请输入书名', filesUnavailable: '文件访问不可用',
  untrustedRequest: '请求未通过信任校验', requestTooLarge: '请求内容过大', invalidRequest: '请求无效', workbenchFailed: '工作台操作失败',
} satisfies Record<keyof typeof en, string>
