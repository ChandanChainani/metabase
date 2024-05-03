git reset HEAD~1
rm ./backport.sh
git cherry-pick 60657636f0c06da8ac093d82b53207caf8ef1827
echo 'Resolve conflicts and force push this branch'
