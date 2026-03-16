# Plugins vs Recipes: Understanding the Difference

**A complete guide to understanding when to use Plugins and when to use Recipes**

##  The Confusion

You might be wondering:

> "If I have a Security Plugin that generates SBOM, and I also have a Security Recipe that generates SBOM... what's the difference? Which one do I need?"

**Short answer**: You need **both**, but they do **different things**.

---

## The Simple Analogy

Think of building a house:

| Concept         | House Building                    | Kubit Forge                            |
| --------------- | --------------------------------- | -------------------------------------- |
| **Plugin**      | Tools (hammer, saw, drill)        | Commands that do work                  |
| **Recipe**      | Blueprint + Instructions          | Automated setup of everything          |
| **Result**      | You can build manually with tools | You can run commands manually          |
| **With Recipe** | Contractor does it all for you    | Everything is configured automatically |

---

##  What is a Plugin?

A **Plugin** provides **new commands** (functionality).

### Plugin = Functionality

```typescript
// This is what a plugin DOES:
// It adds NEW COMMANDS to the CLI

@kubit/plugin-security
 sbom:generate          NEW COMMAND
 sbom:validate          NEW COMMAND
 security:audit         NEW COMMAND
 security:scan          NEW COMMAND
 security:check         NEW COMMAND
```

### Example: Using a Plugin

```bash
# 1. Install the plugin
yarn add -D @kubit/plugin-security

# 2. Enable it in config
echo '[plugins]
enabled = ["@kubit/plugin-security"]' >> kubit.config.toml

# 3. Now you have NEW COMMANDS available
kubit-forge sbom:generate --format cyclonedx
kubit-forge security:audit --level high
kubit-forge security:check
```

### What the Plugin Contains

The plugin is **TypeScript code** that implements the actual logic:

```typescript
// Inside @kubit/plugin-security
export const securityPlugin: Plugin = {
  name: '@kubit/plugin-security',

  registerCommands(): CommandRegistration[] {
    return [
      {
        name: 'sbom:generate',
        action: async (args, ctx) => {
          //  ACTUAL CODE that reads package.json
          //  ACTUAL CODE that generates SBOM file
          //  ACTUAL CODE that writes the file
        },
      },
      {
        name: 'security:audit',
        action: async (args, ctx) => {
          //  ACTUAL CODE that runs npm audit
          //  ACTUAL CODE that analyzes vulnerabilities
        },
      },
    ];
  },
};
```

---

##  What is a Recipe?

A **Recipe** provides **automated setup** (configuration).

### Recipe = Automation

```json
// This is what a recipe DOES:
// It CONFIGURES everything for you automatically

security-sbom-workflow
 Step 1: Install plugin           Runs: yarn add -D @kubit/plugin-security
 Step 2: Enable plugin            Creates: kubit.config.toml config
 Step 3: Create CI workflow       Creates: .github/workflows/security.yml
 Step 4: Add npm scripts          Updates: package.json
 Step 5: Add prerelease hook      Updates: package.json
 Step 6: Update .gitignore        Updates: .gitignore
```

### Example: Using a Recipe

```bash
# ONE command does ALL of the above
kubit-forge recipe apply security-sbom-workflow

# What it does automatically:
#  Installs @kubit/plugin-security
#  Creates kubit.config.toml with plugin enabled
#  Creates .github/workflows/security.yml
#  Adds npm scripts (security, sbom, etc.)
#  Adds prerelease hook
#  Updates .gitignore
```

### What the Recipe Contains

The recipe is **JSON configuration** that describes steps:

```json
{
  "name": "security-sbom-workflow",
  "steps": [
    {
      "id": "install-plugin",
      "type": "shell",
      "script": "yarn add -D @kubit/plugin-security"
    },
    {
      "id": "create-workflow",
      "type": "file",
      "operation": "create",
      "target": ".github/workflows/security.yml",
      "content": "name: Security\n..."
    }
  ]
}
```

The recipe **uses the commands** from the plugin in the workflow it creates.

---

##  How They Work Together

```

                    YOUR PROJECT                          

                                                          
  1. Apply Recipe                                         
     kubit-forge recipe apply security-sbom-workflow      
                                                          
  2. Recipe installs Plugin                               
     yarn add -D @kubit/plugin-security                   
                                                          
  3. Recipe creates CI workflow                           
     .github/workflows/security.yml:                      
       - run: kubit-forge sbom:generate   Uses Plugin   
       - run: kubit-forge security:audit  Uses Plugin   
                                                          
  4. Recipe adds npm scripts                              
     package.json:                                        
       "security": "kubit-forge security:audit"  Plugin 
       "sbom": "kubit-forge sbom:generate"      Plugin  
                                                          

```

---

## When to Use Each One

### Use Plugin Only (Manual Setup)

**Scenario**: You want full control over your setup.

```bash
# Manual approach
yarn add -D @kubit/plugin-security
# Edit kubit.config.toml manually
# Create workflows manually
# Add scripts manually
# Run commands when needed
kubit-forge sbom:generate
```

** Use when:**

- Small/personal projects
- Custom configuration needed
- Learning/experimenting
- Don't need CI/CD
- Want to understand everything

**Time**: 30-60 minutes of manual setup

---

### Use Plugin + Recipe (Automated Setup)

**Scenario**: You want enterprise-ready setup quickly.

```bash
# Automated approach
kubit-forge recipe apply security-sbom-workflow

# Done! Everything is configured:
#  Plugin installed
#  CI/CD workflows created
#  npm scripts added
#  Best practices applied
```

** Use when:**

- Enterprise/production projects
- Need CI/CD integration
- Want best practices
- Team standardization
- Save time

**Time**: 2 minutes automated

---

## Detailed Comparison

| Aspect            | Plugin                        | Recipe                                     |
| ----------------- | ----------------------------- | ------------------------------------------ |
| **What it is**    | TypeScript code               | JSON configuration                         |
| **Provides**      | New commands                  | Automated setup                            |
| **Installation**  | `yarn add -D @kubit/plugin-*` | `recipe apply name`                        |
| **Location**      | `node_modules/`               | `src/recipes/optional/`                    |
| **Purpose**       | Add functionality             | Configure everything                       |
| **Required?**     | Yes (to run commands)         | No (optional automation)                   |
| **Example**       | `sbom:generate` command       | Creates workflow that uses `sbom:generate` |
| **Size**          | ~500 lines of code            | ~100 lines of JSON                         |
| **Maintenance**   | Updated via npm               | Updated in CLI                             |
| **Customization** | Via command options           | Via recipe variables                       |

---

## Real-World Examples

### Example 1: Security Plugin

**Plugin** (`@kubit/plugin-security`):

```bash
# Commands it provides:
kubit-forge sbom:generate --format cyclonedx
kubit-forge sbom:validate --file sbom.json
kubit-forge security:audit --level high
kubit-forge security:scan
kubit-forge security:check --strict
```

**Recipe** (`security-sbom-workflow`):

```bash
# What it sets up:
1. Installs the security plugin
2. Creates .github/workflows/security.yml that runs:
   - sbom:generate
   - security:audit
   - security:check
3. Adds npm scripts:
   - "security": "kubit-forge security:audit"
   - "sbom": "kubit-forge sbom:generate"
4. Adds prerelease hook
5. Updates .gitignore
```

---

### Example 2: Doctor Advanced Plugin

**Plugin** (`@kubit/plugin-doctor-advanced`):

```bash
# Commands it provides:
kubit-forge doctor:fix --dry-run
kubit-forge doctor:predictive
kubit-forge doctor:export --format sarif
kubit-forge doctor:recommendations
```

**Recipe** (`doctor-advanced-workflow`):

```bash
# What it sets up:
1. Installs the doctor advanced plugin
2. Creates .github/workflows/doctor.yml that runs:
   - doctor:fix
   - doctor:predictive
   - doctor:export
3. Creates .vscode/tasks.json with doctor tasks
4. Adds npm scripts for all commands
5. Configures doctor settings in kubit.config.toml
```

---

## Complete Architecture

```

               KUBIT FORGE CORE CLI                     
                  (181 KB)                              
                                                        
  Essential commands only:                              
  init, create, build, dev, test, generate, etc.       

                        
        
                                       
                                       
             
    PLUGINS                      RECIPES      
 (Functionality)               (Automation)    
             
                                       
         @kubit/plugin-security      security-sbom-workflow
                                          
             sbom:generate  Uses this command
             security:audit  Uses this command
             security:check  Uses this command
                                       
         @kubit/plugin-doctor-advanced    doctor-advanced-workflow
                                          
             doctor:fix  Uses this command
             doctor:predictive  Uses this command
             doctor:export  Uses this command
                                       
         testing-complete-setup
                                             
                                              No plugin needed
                                                  Installs everything directly
```

---

## Decision Tree

```
Do you need new functionality (commands)?

 YES  Install PLUGIN
        
        Do you want automated setup?
        
         YES  Also apply RECIPE
                
                Quick enterprise setup
        
         NO  Configure manually
                 
                 Full control

 NO  Just use core CLI
         
         Basic functionality 
```

---

## Common Questions

### Q1: Can I use a Recipe without the Plugin?

**No.** Recipes that require plugins will install them automatically.

```bash
# Recipe installs the plugin for you
kubit-forge recipe apply security-sbom-workflow
#  automatically runs
# yarn add -D @kubit/plugin-security
```

### Q2: Can I use a Plugin without the Recipe?

**Yes!** Plugins work independently.

```bash
# Install and use plugin manually
yarn add -D @kubit/plugin-security
kubit-forge sbom:generate
```

### Q3: Are Recipes mandatory?

**No.** Recipes are **optional automation**. You can set up everything manually if you prefer.

### Q4: Can I customize a Recipe?

**Yes!** Recipes support variables.

```bash
kubit-forge recipe apply security-sbom-workflow \
  --var sbomFormat=spdx \
  --var auditLevel=critical
```

### Q5: What if I don't need CI/CD?

**Use only the Plugin.** Skip the recipe and run commands manually.

```bash
# No CI/CD needed
yarn add -D @kubit/plugin-security
kubit-forge sbom:generate  # Run when needed
```

---

## Recommended Workflows

### For Learning / Small Projects

```bash
# 1. Start simple with core CLI
kubit-forge init my-app

# 2. Add plugin when needed
yarn add -D @kubit/plugin-security

# 3. Use commands manually
kubit-forge sbom:generate
```

### For Production / Enterprise

```bash
# 1. Start with core
kubit-forge init my-app

# 2. Apply recipes for complete setup
kubit-forge recipe apply security-sbom-workflow
kubit-forge recipe apply testing-complete-setup
kubit-forge recipe apply doctor-advanced-workflow

# Done! Everything configured
```

### For Teams

```bash
# 1. Create project
kubit-forge init team-app

# 2. Apply recipes for standardization
kubit-forge recipe apply security-sbom-workflow
kubit-forge recipe apply monorepo-turborepo-setup

# 3. All team members get same setup
# Just: git clone && yarn install
```

---

## Summary

### Plugin = Tools

- **Adds new commands** to the CLI
- **Implements functionality** in TypeScript
- **Required** to run the commands
- **Example**: `kubit-forge sbom:generate`

### Recipe = Automation 

- **Configures everything** automatically
- **Creates files** (workflows, scripts, configs)
- **Optional** time-saver
- **Example**: Creates CI/CD that uses plugin commands

### Together = Best of Both Worlds

```bash
# One command for complete setup
kubit-forge recipe apply security-sbom-workflow

# Result:
#  Plugin installed (functionality)
#  Workflows created (automation)
#  Scripts configured (convenience)
#  Best practices applied (quality)
#  Ready for production (professional)
```

---

## Related Documentation

- [Plugin System](./PLUGIN-SYSTEM.md)
- [Plugin Security](./PLUGIN-SECURITY.md)
- [Plugin Doctor Advanced](./PLUGIN-DOCTOR-ADVANCED.md)
- [Optional Recipes](./RECIPES-OPTIONAL.md)
- [Core Recipes](./RECIPES.md)

---

**Still confused?** Think of it this way:

- **Plugin** = App you install on your phone (gives you features)
- **Recipe** = Setup wizard that configures the app for you

You need the **app** to use it, but the **wizard** makes setup faster!
