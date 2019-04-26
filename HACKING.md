##  Publishing the Tegh UI

1. run `yarn start` and once the server is started run `yarn watch` in a second tab
2. verify that the UI works as expected in Beaker and Firefox
3. Publish the dat archive from Beaker
4. verify that dat://tegh.io has been updated
5. `cp -R ./packages/tegh-web-ui/dist/* ../tegh.github.com && cd ../tegh.github.com && git add -A && git commit -a && git push`
6. verify that https://tegh.io has been updated
