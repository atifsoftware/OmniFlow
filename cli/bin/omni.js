#!/usr/bin/env node

const readline = require('readline');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '../../');
const backendDir = path.join(rootDir, 'apps/backend');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  dim: '\x1b[2m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function printHeader() {
  console.clear();
  console.log(colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║' + colors.bold + '          OMNIFLOW ENTERPRISE CLI 3.0                    ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║' + colors.dim + '       Full-Stack Enterprise Framework for Node.js        ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('');
}

function showMenu() {
  console.log(colors.bold + colors.white + '┌─ MAIN MENU ──────────────────────────────────────────────┐' + colors.reset);
  console.log('');
  console.log(colors.bold + '  📋 FRAMEWORK' + colors.reset);
  console.log('  1. ' + colors.cyan + 'route:list        ' + colors.dim + 'View all registered API routes' + colors.reset);
  console.log('  2. ' + colors.blue + 'make:module       ' + colors.dim + 'Scaffold a new ERP module' + colors.reset);
  console.log('  3. ' + colors.blue + 'make:dto          ' + colors.dim + 'Scaffold a validation DTO' + colors.reset);
  console.log('  4. ' + colors.blue + 'make:job          ' + colors.dim + 'Scaffold a background job class' + colors.reset);
  console.log('  5. ' + colors.blue + 'make:policy       ' + colors.dim + 'Scaffold a Gate policy file' + colors.reset);
  console.log('');
  console.log(colors.bold + '  🗄️  DATABASE' + colors.reset);
  console.log('  6. ' + colors.green + 'db:push           ' + colors.dim + 'Push schema changes (Prisma db push)' + colors.reset);
  console.log('  7. ' + colors.green + 'db:migrate        ' + colors.dim + 'Run migration (Prisma migrate dev)' + colors.reset);
  console.log('  8. ' + colors.green + 'db:seed           ' + colors.dim + 'Run database seeders' + colors.reset);
  console.log('  9. ' + colors.green + 'db:studio         ' + colors.dim + 'Launch Prisma Studio GUI' + colors.reset);
  console.log('');
  console.log(colors.bold + '  ⚡ QUEUE & CACHE' + colors.reset);
  console.log('  10. ' + colors.yellow + 'queue:status      ' + colors.dim + 'View queue statistics' + colors.reset);
  console.log('  11. ' + colors.yellow + 'cache:clear       ' + colors.dim + 'Clear all application cache' + colors.reset);
  console.log('');
  console.log(colors.bold + '  📄 LOGS' + colors.reset);
  console.log('  12. ' + colors.magenta + 'log:tail          ' + colors.dim + 'View last 50 log entries' + colors.reset);
  console.log('  13. ' + colors.magenta + 'log:errors        ' + colors.dim + 'View last 50 error log entries' + colors.reset);
  console.log('  14. ' + colors.magenta + 'log:clear         ' + colors.dim + 'Clear all log files' + colors.reset);
  console.log('');
  console.log(colors.bold + '  🚀 SERVER' + colors.reset);
  console.log('  15. ' + colors.yellow + 'serve             ' + colors.dim + 'Start dev server (npm run dev)' + colors.reset);
  console.log('  16. ' + colors.green + 'build             ' + colors.dim + 'Build for production' + colors.reset);
  console.log('  17. ' + colors.cyan + 'key:generate      ' + colors.dim + 'Generate a secure APP_KEY' + colors.reset);
  console.log('');
  console.log(colors.bold + '  AI & ADVANCED' + colors.reset);
  console.log('  18. ' + colors.magenta + 'ai:ask            ' + colors.dim + 'Ask Gemini AI a question' + colors.reset);
  console.log('  19. ' + colors.magenta + 'token:purge       ' + colors.dim + 'Purge all expired API tokens' + colors.reset);
  console.log('  20. ' + colors.blue + 'make:model        ' + colors.dim + 'Scaffold a BaseModel class' + colors.reset);
  console.log('');
  console.log(colors.bold + '  🌐 FULL-STACK MONOREPO' + colors.reset);
  console.log('  21. ' + colors.cyan + 'serve:web         ' + colors.dim + 'Start Next.js Web & Admin (port 3000)' + colors.reset);
  console.log('  22. ' + colors.cyan + 'serve:mobile      ' + colors.dim + 'Start React Native Expo Mobile App' + colors.reset);
  console.log('  23. ' + colors.green + 'build:all         ' + colors.dim + 'Build Shared & Backend packages' + colors.reset);
  console.log('');
  console.log(colors.bold + colors.white + '└──────────────────────────────────────────────────────────┘' + colors.reset);
  console.log('  0. ' + colors.red + 'Exit' + colors.reset);
  console.log('');

  rl.question(colors.yellow + '  Select option: ' + colors.reset, (choice) => {
    handleChoice(choice.trim());
  });
}

function handleChoice(choice) {
  switch (choice) {
    case '1': cmdRouteList(); break;
    case '2': cmdMakeModule(); break;
    case '3': cmdMakeDto(); break;
    case '4': cmdMakeJob(); break;
    case '5': cmdMakePolicy(); break;
    case '6': cmdDbPush(); break;
    case '7': cmdDbMigrate(); break;
    case '8': cmdDbSeed(); break;
    case '9': cmdDbStudio(); break;
    case '10': cmdQueueStatus(); break;
    case '11': cmdCacheClear(); break;
    case '12': cmdLogTail(false); break;
    case '13': cmdLogTail(true); break;
    case '14': cmdLogClear(); break;
    case '15': cmdServe(); break;
    case '16': cmdBuild(); break;
    case '17': cmdKeyGenerate(); break;
    case '18': cmdAiAsk(); break;
    case '19': cmdTokenPurge(); break;
    case '20': cmdMakeModel(); break;
    case '21': cmdServeWeb(); break;
    case '22': cmdServeMobile(); break;
    case '23': cmdBuildAll(); break;
    case '0':
      console.log(colors.cyan + '\n  Goodbye! OmniFlow Framework ' + colors.reset);
      rl.close();
      process.exit(0);
    default:
      console.log(colors.red + '\n  Invalid option. Please try again.' + colors.reset);
      setTimeout(backToMenu, 1000);
  }
}

function backToMenu() {
  printHeader();
  showMenu();
}

function execCmd(cmd, cwd) {
  try {
    const output = execSync(cmd, { cwd: cwd || backendDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { success: true, output };
  } catch (err) {
    return { success: false, output: err.stderr || err.message };
  }
}

// ──────────────────────────────────────────────
//  COMMAND HANDLERS
// ──────────────────────────────────────────────

function cmdRouteList() {
  console.log('\n' + colors.cyan + '  Scanning registered routes...' + colors.reset + '\n');
  const result = execCmd('npx ts-node -e "const { NestFactory } = require(\'@nestjs/core\'); console.log(\'Routes loaded\');"');
  
  // Fallback: scan route files
  const routesDir = path.join(backendDir, 'src');
  const routes = [];
  function scanRoutes(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) { scanRoutes(fullPath); continue; }
      if (!file.endsWith('.controller.ts')) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      const controllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
      const basePath = controllerMatch ? controllerMatch[1] : 'unknown';
      const methodMatches = [...content.matchAll(/@(Get|Post|Put|Patch|Delete|Head|Options)\(['"]?([^'")\s]*)?['"]?\)/g)];
      for (const [, method, routePath] of methodMatches) {
        routes.push({ method: method.toUpperCase(), path: '/api/' + basePath + (routePath ? '/' + routePath : ''), file: file });
      }
    }
  }
  scanRoutes(routesDir);

  if (routes.length === 0) {
    console.log(colors.yellow + '  No routes found.' + colors.reset);
  } else {
    const methodColors = { GET: colors.green, POST: colors.blue, PUT: colors.yellow, PATCH: colors.yellow, DELETE: colors.red };
    console.log(colors.bold + '  METHOD    PATH                                    FILE' + colors.reset);
    console.log(colors.dim + '  ' + '─'.repeat(70) + colors.reset);
    for (const r of routes) {
      const mc = methodColors[r.method] || colors.white;
      const methodPad = r.method.padEnd(8);
      const pathPad = r.path.padEnd(40);
      console.log('  ' + mc + methodPad + colors.reset + '  ' + pathPad + '  ' + colors.dim + r.file + colors.reset);
    }
    console.log('\n' + colors.dim + '  Total: ' + routes.length + ' routes' + colors.reset);
  }
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdMakeModule() {
  rl.question('\n  ' + colors.yellow + 'Module name (e.g. Supplier): ' + colors.reset, (name) => {
    if (!name) { console.log(colors.red + '  Module name required.' + colors.reset); return setTimeout(backToMenu, 1000); }
    const moduleName = name.charAt(0).toUpperCase() + name.slice(1);
    const moduleDir = path.join(backendDir, 'src', 'modules', moduleName.toLowerCase());
    
    if (fs.existsSync(moduleDir)) {
      console.log(colors.red + '  Module already exists: ' + moduleName + colors.reset);
      return setTimeout(backToMenu, 1500);
    }
    fs.mkdirSync(moduleDir, { recursive: true });

    const lname = moduleName.toLowerCase();
    const files = {
      [`${lname}.module.ts`]: `import { Module } from '@nestjs/common';\nimport { ${moduleName}Controller } from './${lname}.controller';\nimport { ${moduleName}Service } from './${lname}.service';\n\n@Module({\n  controllers: [${moduleName}Controller],\n  providers: [${moduleName}Service],\n  exports: [${moduleName}Service],\n})\nexport class ${moduleName}Module {}\n`,
      [`${lname}.controller.ts`]: `import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';\nimport { ${moduleName}Service } from './${lname}.service';\nimport { OmniResponse } from '../../core/response/omni-response';\n\n@Controller('${lname}s')\nexport class ${moduleName}Controller {\n  constructor(private readonly ${lname}Service: ${moduleName}Service) {}\n\n  @Get()\n  async index() {\n    const data = await this.${lname}Service.findAll();\n    return OmniResponse.success(data);\n  }\n\n  @Get(':id')\n  async show(@Param('id', ParseIntPipe) id: number) {\n    const data = await this.${lname}Service.findOne(id);\n    return OmniResponse.success(data);\n  }\n\n  @Post()\n  async store(@Body() body: Record<string, unknown>) {\n    const data = await this.${lname}Service.create(body);\n    return OmniResponse.created(data);\n  }\n\n  @Put(':id')\n  async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {\n    const data = await this.${lname}Service.update(id, body);\n    return OmniResponse.success(data);\n  }\n\n  @Delete(':id')\n  async destroy(@Param('id', ParseIntPipe) id: number) {\n    await this.${lname}Service.remove(id);\n    return OmniResponse.noContent();\n  }\n}\n`,
      [`${lname}.service.ts`]: `import { Injectable } from '@nestjs/common';\nimport { OmniDbService } from '../../core/database/omni-db.service';\n\n@Injectable()\nexport class ${moduleName}Service {\n  constructor(private readonly db: OmniDbService) {}\n\n  async findAll() {\n    return this.db.table('${lname}s').latest().get();\n  }\n\n  async findOne(id: number) {\n    return this.db.table('${lname}s').where('id', id).first();\n  }\n\n  async create(data: Record<string, unknown>) {\n    const id = await this.db.table('${lname}s').insert(data);\n    return this.findOne(id);\n  }\n\n  async update(id: number, data: Record<string, unknown>) {\n    await this.db.table('${lname}s').where('id', id).update(data);\n    return this.findOne(id);\n  }\n\n  async remove(id: number) {\n    return this.db.table('${lname}s').where('id', id).delete();\n  }\n}\n`,
    };

    for (const [filename, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(moduleDir, filename), content);
    }

    console.log(colors.green + '\n  ✅ Module created: ' + moduleName + colors.reset);
    console.log(colors.dim + '  📁 ' + moduleDir + colors.reset);
    console.log(colors.yellow + '\n  💡 Add to app.module.ts imports: ' + moduleName + 'Module' + colors.reset);
    rl.question('\n  Press Enter to return...', backToMenu);
  });
}

function cmdMakeDto() {
  rl.question('\n  ' + colors.yellow + 'DTO name (e.g. CreateProduct): ' + colors.reset, (name) => {
    if (!name) { return setTimeout(backToMenu, 1000); }
    const dtoName = name.charAt(0).toUpperCase() + name.slice(1);
    const filename = dtoName.toLowerCase().replace(/([A-Z])/g, (m, p, o) => o > 0 ? '-' + m.toLowerCase() : m.toLowerCase()) + '.dto.ts';
    
    rl.question('  Module path (e.g. src/modules/products): ', (modulePath) => {
      const targetDir = path.join(backendDir, modulePath || 'src/common/dto');
      fs.mkdirSync(targetDir, { recursive: true });
      const content = `import { IsString, IsNumber, IsEmail, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';\n\nexport class ${dtoName}Dto {\n  @IsNotEmpty()\n  @IsString()\n  name: string;\n\n  // Add more fields here\n}\n`;
      fs.writeFileSync(path.join(targetDir, filename), content);
      console.log(colors.green + '\n  ✅ DTO created: ' + filename + colors.reset);
      rl.question('\n  Press Enter to return...', backToMenu);
    });
  });
}

function cmdMakeJob() {
  rl.question('\n  ' + colors.yellow + 'Job name (e.g. SendInvoiceEmail): ' + colors.reset, (name) => {
    if (!name) { return setTimeout(backToMenu, 1000); }
    const jobName = name.charAt(0).toUpperCase() + name.slice(1);
    const jobDir = path.join(backendDir, 'src', 'jobs');
    fs.mkdirSync(jobDir, { recursive: true });
    const filename = jobName.toLowerCase().replace(/([A-Z])/g, (m, p, o) => o > 0 ? '-' + m.toLowerCase() : m.toLowerCase()) + '.job.ts';
    const content = `import { BaseJob } from '../core/queue/base-job';\n\n/**\n * ${jobName} Job\n * Push to queue: await omniQueue.push(new ${jobName}Job(data));\n */\nexport class ${jobName}Job extends BaseJob {\n  queue = 'default';\n  tries = 3;\n  delay = 0;\n\n  constructor(public data: Record<string, unknown>) {\n    super();\n  }\n\n  async handle(): Promise<void> {\n    // TODO: Implement job logic\n    console.log('[${jobName}Job] Processing:', this.data);\n  }\n}\n`;
    fs.writeFileSync(path.join(jobDir, filename), content);
    console.log(colors.green + '\n  ✅ Job created: ' + filename + colors.reset);
    rl.question('\n  Press Enter to return...', backToMenu);
  });
}

function cmdMakePolicy() {
  rl.question('\n  ' + colors.yellow + 'Policy name (e.g. Product): ' + colors.reset, (name) => {
    if (!name) { return setTimeout(backToMenu, 1000); }
    const policyName = name.charAt(0).toUpperCase() + name.slice(1);
    const policyDir = path.join(backendDir, 'src', 'policies');
    fs.mkdirSync(policyDir, { recursive: true });
    const filename = policyName.toLowerCase() + '.policy.ts';
    const content = `/**\n * ${policyName}Policy\n * Register in AppModule: gate.policy('${policyName}', ${policyName}Policy);\n */\nexport const ${policyName}Policy = {\n  viewAny: (user: Record<string, unknown>) => true,\n  view: (user: Record<string, unknown>, resource: Record<string, unknown>) => true,\n  create: (user: Record<string, unknown>) => ['admin', 'manager'].includes(user.role as string),\n  update: (user: Record<string, unknown>, resource: Record<string, unknown>) => user.role === 'admin' || resource.userId === user.id,\n  delete: (user: Record<string, unknown>) => user.role === 'admin',\n};\n`;
    fs.writeFileSync(path.join(policyDir, filename), content);
    console.log(colors.green + '\n  ✅ Policy created: ' + filename + colors.reset);
    rl.question('\n  Press Enter to return...', backToMenu);
  });
}

function cmdDbPush() {
  console.log('\n' + colors.green + '  Running: npx prisma db push...' + colors.reset);
  try {
    execSync('npx prisma db push', { cwd: backendDir, stdio: 'inherit' });
    console.log(colors.green + '\n  ✅ Database schema pushed!' + colors.reset);
  } catch { console.log(colors.red + '\n  ❌ db push failed.' + colors.reset); }
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdDbMigrate() {
  rl.question('\n  Migration name: ', (migName) => {
    if (!migName) migName = 'update_' + Date.now();
    console.log('\n' + colors.green + '  Running: npx prisma migrate dev...' + colors.reset);
    try {
      execSync('npx prisma migrate dev --name ' + migName, { cwd: backendDir, stdio: 'inherit' });
      console.log(colors.green + '\n  ✅ Migration complete!' + colors.reset);
    } catch { console.log(colors.red + '\n  ❌ Migration failed.' + colors.reset); }
    rl.question('\n  Press Enter to return...', backToMenu);
  });
}

function cmdDbSeed() {
  console.log('\n' + colors.green + '  Running seeders...' + colors.reset);
  try {
    execSync('npx prisma db seed', { cwd: backendDir, stdio: 'inherit' });
    console.log(colors.green + '\n  ✅ Database seeded!' + colors.reset);
  } catch { console.log(colors.red + '\n  ❌ Seeding failed.' + colors.reset); }
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdDbStudio() {
  console.log('\n' + colors.magenta + '  Launching Prisma Studio...' + colors.reset);
  spawn('npx', ['prisma', 'studio'], { cwd: backendDir, stdio: 'inherit', shell: true });
  setTimeout(backToMenu, 2000);
}

function cmdQueueStatus() {
  console.log('\n' + colors.yellow + '  Queue Status' + colors.reset);
  const jobsFile = path.join(rootDir, 'storage', 'logs', 'app.log');
  console.log(colors.dim + '  Note: For live stats, use GET /api/health endpoint.' + colors.reset);
  console.log('\n' + colors.green + '  ✅ OmniQueueService is managing: omni_jobs & omni_failed_jobs tables.' + colors.reset);
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdCacheClear() {
  const cacheDir = path.join(backendDir, 'storage', 'cache');
  let cleared = 0;
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.cache.json'));
    for (const file of files) { fs.unlinkSync(path.join(cacheDir, file)); cleared++; }
  }
  console.log(colors.green + '\n  ✅ Cache cleared: ' + cleared + ' files removed.' + colors.reset);
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdLogTail(errorOnly) {
  const logFile = errorOnly 
    ? path.join(process.cwd(), 'storage', 'logs', 'error.log')
    : path.join(process.cwd(), 'storage', 'logs', 'app.log');
  
  const label = errorOnly ? 'ERROR LOG' : 'APP LOG';
  console.log('\n' + colors.magenta + '  === ' + label + ' (Last 30 entries) ===' + colors.reset + '\n');
  
  if (!fs.existsSync(logFile)) {
    console.log(colors.dim + '  No log file found at: ' + logFile + colors.reset);
  } else {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim()).reverse().slice(0, 30);
    for (const line of lines) {
      if (line.includes('ERROR') || line.includes('CRITICAL')) {
        console.log(colors.red + '  ' + line + colors.reset);
      } else if (line.includes('WARNING')) {
        console.log(colors.yellow + '  ' + line + colors.reset);
      } else {
        console.log(colors.dim + '  ' + line + colors.reset);
      }
    }
  }
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdLogClear() {
  const logsDir = path.join(process.cwd(), 'storage', 'logs');
  const files = ['app.log', 'error.log'];
  for (const f of files) {
    const fp = path.join(logsDir, f);
    if (fs.existsSync(fp)) fs.writeFileSync(fp, '');
  }
  console.log(colors.green + '\n  ✅ Log files cleared.' + colors.reset);
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdServe() {
  console.log('\n' + colors.yellow + '  Starting dev server...' + colors.reset);
  const proc = spawn('npm', ['run', 'dev'], { cwd: rootDir, stdio: 'inherit', shell: true });
  proc.on('close', backToMenu);
}

function cmdBuild() {
  console.log('\n' + colors.green + '  Building for production...' + colors.reset);
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    console.log(colors.green + '\n  ✅ Build complete!' + colors.reset);
  } catch { console.log(colors.red + '\n  ❌ Build failed.' + colors.reset); }
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdKeyGenerate() {
  const crypto = require('crypto');
  const key = 'omni_' + crypto.randomBytes(32).toString('hex');
  console.log('\n' + colors.cyan + '  Generated APP_KEY:' + colors.reset);
  console.log('\n  ' + colors.bold + colors.green + key + colors.reset + '\n');
  console.log(colors.dim + '  Add this to your .env file as APP_KEY=' + key + colors.reset);
  rl.question('\n  Press Enter to return...', backToMenu);
}

// ──────────────────────────────────────────────
//  ENTRY POINT
// ──────────────────────────────────────────────

// Support direct CLI: node omni.js route:list
const directCmd = process.argv[2];
if (directCmd) {
  const cmdMap = {
    'route:list': cmdRouteList,
    'key:generate': cmdKeyGenerate,
    'cache:clear': cmdCacheClear,
    'log:tail': () => cmdLogTail(false),
    'log:errors': () => cmdLogTail(true),
    'log:clear': cmdLogClear,
    'queue:status': cmdQueueStatus,
    'db:push': cmdDbPush,
    'ai:ask': cmdAiAsk,
    'token:purge': cmdTokenPurge,
    'db:migrate': cmdDbMigrate,
    'db:seed': cmdDbSeed,
  };
  const fn = cmdMap[directCmd];
  if (fn) { fn(); } else {
    console.log(colors.red + 'Unknown command: ' + directCmd + colors.reset);
    console.log('Available: ' + Object.keys(cmdMap).join(', '));
    process.exit(1);
  }
} else {
  printHeader();
  showMenu();
}


function cmdAiAsk() {
  rl.question('\n  ' + colors.magenta + 'Your question for Gemini AI: ' + colors.reset, async (question) => {
    if (!question.trim()) { return setTimeout(backToMenu, 1000); }
    console.log('\n' + colors.dim + '  Thinking...' + colors.reset);
    
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log(colors.red + '\n  Error: GEMINI_API_KEY is not configured in .env' + colors.reset);
      return rl.question('\n  Press Enter to return...', backToMenu);
    }

    const https = require('https');
    const payload = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    });

    const req = https.request(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
      (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
            console.log('\n' + colors.magenta + '  AI Response:' + colors.reset + '\n');
            const lines = text.split('\n');
            lines.forEach(line => console.log('  ' + colors.white + line + colors.reset));
          } catch {
            console.log(colors.red + '  Error parsing AI response.' + colors.reset);
          }
          rl.question('\n  Press Enter to return...', backToMenu);
        });
      }
    );
    req.on('error', err => { console.log(colors.red + '  Error: ' + err.message + colors.reset); rl.question('\n  Press Enter...', backToMenu); });
    req.write(payload);
    req.end();
  });
}

function cmdTokenPurge() {
  console.log('\n' + colors.magenta + '  Purging expired tokens...' + colors.reset);
  console.log(colors.dim + '  OmniTokenService will automatically purge tokens on schedule.' + colors.reset);
  console.log(colors.dim + '  You can also call: POST /api/auth/tokens/purge' + colors.reset);
  console.log('\n' + colors.green + '  Tip: Add to your cron: await tokenService.pruneExpired()' + colors.reset);
  rl.question('\n  Press Enter to return...', backToMenu);
}

function cmdMakeModel() {
  rl.question('\n  ' + colors.yellow + 'Model name (e.g. Product): ' + colors.reset, (name) => {
    if (!name) { return setTimeout(backToMenu, 1000); }
    const modelName = name.charAt(0).toUpperCase() + name.slice(1);
    const modelsDir = path.join(backendDir, 'src', 'models');
    const lname = modelName.toLowerCase();
    fs.mkdirSync(modelsDir, { recursive: true });
    const content = `import { BaseModel } from '../core/database/base-model';\n\n/**\n * ${modelName} Model\n * Table: ${lname}s (auto-detected)\n */\nexport class ${modelName} extends BaseModel {\n  static table = '${lname}s';\n  static primaryKey = 'id';\n  static softDeletes = false;\n  static hidden: string[] = []; // Fields excluded from toJSON()\n\n  // ─── Relationships ────────────────────────────────────────\n  // posts() { return this.hasMany(Post, 'user_id'); }\n  // category() { return this.belongsTo(Category, 'category_id'); }\n\n  // ─── Custom Methods ───────────────────────────────────────\n  // static async findByEmail(email: string) {\n  //   return this.query().where('email', email).first();\n  // }\n}\n`;
    fs.writeFileSync(path.join(modelsDir, modelName + '.ts'), content);
    console.log(colors.green + '\n  Model created: src/models/' + modelName + '.ts' + colors.reset);
    rl.question('\n  Press Enter to return...', backToMenu);
  });
}

function cmdServeWeb() {
  console.log('\n' + colors.cyan + '  Starting Next.js Web & Admin portal on port 3000...' + colors.reset);
  console.log(colors.dim + '  Run: npm run dev:web' + colors.reset);
  const child = spawn('npm', ['run', 'dev:web'], { cwd: rootDir, stdio: 'inherit', shell: true });
  child.on('exit', () => backToMenu());
}

function cmdServeMobile() {
  console.log('\n' + colors.cyan + '  Starting React Native Expo Mobile App...' + colors.reset);
  console.log(colors.dim + '  Run: npm run dev:mobile' + colors.reset);
  const child = spawn('npm', ['run', 'dev:mobile'], { cwd: rootDir, stdio: 'inherit', shell: true });
  child.on('exit', () => backToMenu());
}

function cmdBuildAll() {
  console.log('\n' + colors.green + '  Building Full-Stack Monorepo...' + colors.reset);
  const res = execCmd('npm run build', rootDir);
  console.log(res.output);
  rl.question('\n  Press Enter to return...', backToMenu);
}
