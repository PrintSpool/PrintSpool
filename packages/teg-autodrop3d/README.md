## Teg AutoDrop3D Client

Pulls jobs from your AutoDrop3D queue and runs them on your Teg 3D printer.

## Installation

Add the following lines to the plugins array in your `./teg/config.json` replacing the `DEVICE_ID` with your own AutoDrop3D device ID:

```json
{
  "id": "zxcvojiwdnklsd",
  "modelVersion": 1,
  "package": "@tegapp/autodrop3d",
  "model": {
    "deviceID": "DEVICE_ID",
    "apiURL": null
  }
}
```
