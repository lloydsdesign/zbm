const exec = require('child_process').execSync;
const fs = require('fs-extra');

const dependenciesToLink = ['react-native-mapbox-gl'];
const command = 'node node_modules/react-native/local-cli/cli.js link';

dependenciesToLink.forEach((dependency) => {
  exec(`${command} ${dependency}`);
});

const androidManifestPath = 'android/app/src/main/AndroidManifest.xml';
var androidManifest = fs.readFileSync(androidManifestPath, 'utf8');

const locationPermission = '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />';
const networkPermission = '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />';
const mapboxtelemetryService = '<service android:name="com.mapbox.mapboxsdk.telemetry.TelemetryService" />';

var replacementTag = '<uses-permission android:name="android.permission.INTERNET" />';
var replacement = `
	${locationPermission}
	${networkPermission}
	${replacementTag}
`;

androidManifest = androidManifest.replace(replacementTag, replacement);

replacementTag = '</application>';
replacement = `
	${mapboxtelemetryService}
	${replacementTag}
`;

androidManifest = androidManifest.replace(replacementTag, replacement);

console.log('[trails] - Adding required permissions to AndroidManifest.xml');
fs.writeFileSync(androidManifestPath, androidManifest, 'ascii');


const buildGradlePath = 'android/app/build.gradle';
var buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
const buildGradleChange = 'javaMaxHeapSize "4g"';

replacementTag = 'jumboMode = true';
replacement = `
	${replacementTag}
	${buildGradleChange}
`;

buildGradle = buildGradle.replace(replacementTag, replacement);

console.log('[trails] - Adding required changes to build.gradle');
fs.writeFileSync(buildGradlePath, buildGradle, 'ascii');