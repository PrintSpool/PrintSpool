##  Publishing the Teg UI

1. run `yarn watch` and once the dev server is started run `yarn start` in a second tab
2. verify that the UI works as expected in Beaker and Firefox
3. Publish the dat archive from Beaker
4. verify that dat://tegapp.io has been updated
5. `cp -R ./packages/teg-web-ui/dist/* ../teg.github.com && cd ../teg.github.com && git add -A && git commit -a && git push`
6. verify that https://tegapp.io has been updated

##  Publishing the Teg Snap

`yarn snap:publish`
