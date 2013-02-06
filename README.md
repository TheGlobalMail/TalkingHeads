# Talking Heads

**Needs our special blend of yeoman**

### Setup

*Make sure your cobbweb yeoman is up to date!*

1. `./isntall.sh`
2. `npm install`
3. `yeoman server`
4. Should have a server up n running on port 3502
5. nom nom nom

### Deploy

1. `git branch -D deploy` # Force delete any existing deploy branch
2. `git checkout -b deploy`
3. `yeoman build`
4. `rm -rf dist/components/`
5. `git add dist/`
6. `git commit -m "Build" dist/`
7. `./deploy.js production RACKSPACE_API_KEY`
8. `git push heroku deploy:master --force`
9. `git checkout master`
10. `git branch -D deploy`
