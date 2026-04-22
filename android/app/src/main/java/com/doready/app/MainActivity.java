package com.doready.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import androidx.core.splashscreen.SplashScreen;
import java.util.ArrayList;
import com.getcapacitor.Plugin;

// Explicit imports for custom plugins
import com.doready.app.SystemThemePlugin;
import com.doready.app.plugins.DoReadyBlocker;

import android.webkit.JavascriptInterface;
import android.provider.Settings;
import android.net.Uri;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.Context;
import android.widget.Toast;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        
        applyEdgeToEdgeSettings();

        // 1. Capacitor Registration (Keep as fallback)
        registerPlugin(SystemThemePlugin.class);
        registerPlugin(DoReadyBlocker.class);

        // 2. TOTAL BYPASS: Direct Injection into WebView
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(Color.BLACK);
            // Universal Bridge Name: DoReadyNative
            getBridge().getWebView().addJavascriptInterface(new NativeBridge(), "DoReadyNative");
        }
    }

    // Definitive Bypass Bridge
    class NativeBridge {
        @JavascriptInterface
        public void openAccessibility() {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        }

        @JavascriptInterface
        public void openAppSettings() {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        }

        @JavascriptInterface
        public void showToast(String msg) {
            Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public boolean checkAccessibility() {
            String service = getPackageName() + "/" + ShortsBlockerService.class.getName();
            String prefString = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            return prefString != null && prefString.contains(service);
        }

        @JavascriptInterface
        public void setBlockingEnabled(boolean enabled) {
            SharedPreferences prefs = getSharedPreferences("BlockZonePrefs", Context.MODE_PRIVATE);
            prefs.edit().putBoolean("blocker_enabled", enabled).apply();
            showToast(enabled ? "Bloqueo activado" : "Bloqueo desactivado");
        }

        @JavascriptInterface
        public void openBatteryOptimizationSettings() {
            try {
                Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                openAppSettings();
            }
        }

        @JavascriptInterface
        public void openAutostartSettings() {
            try {
                Intent intent = new Intent();
                String m = android.os.Build.MANUFACTURER.toLowerCase();
                if (m.contains("xiaomi") || m.contains("redmi") || m.contains("poco")) {
                    intent.setComponent(new android.content.ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
                } else if (m.contains("oppo")) {
                    intent.setComponent(new android.content.ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
                } else if (m.contains("vivo")) {
                    intent.setComponent(new android.content.ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"));
                } else if (m.contains("samsung")) {
                    intent.setComponent(new android.content.ComponentName("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"));
                } else {
                    openAppSettings();
                    return;
                }
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                openAppSettings();
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Force re-apply settings whenever the app returns from background (e.g. from YouTube)
        applyEdgeToEdgeSettings();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Ensure settings are applied even if the system attempted to override them on focus gain
            applyEdgeToEdgeSettings();
        }
    }

    private void applyEdgeToEdgeSettings() {
        // True Edge-to-Edge: Draw behind system bars (without hiding them)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Disable Forced Contrast (The "Gray Line" fix for Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setNavigationBarContrastEnforced(false);
            getWindow().setStatusBarContrastEnforced(false);
        }
        
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
    }
}
