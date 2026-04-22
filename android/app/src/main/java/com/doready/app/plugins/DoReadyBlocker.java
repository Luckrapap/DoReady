package com.doready.app.plugins;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;
import android.text.TextUtils;
import android.widget.Toast;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.doready.app.ShortsBlockerService;

@CapacitorPlugin(name = "DoReadyBlocker")
public class DoReadyBlocker extends Plugin {

    private static final String PREFS_NAME = "BlockZonePrefs";
    private static final String KEY_ENABLED = "blocker_enabled";
 
    @PluginMethod
    public void ping(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", "pong");
        call.resolve(ret);
    }

    @PluginMethod
    public void checkStatus(PluginCall call) {
        // Primitive debug toast
        getActivity().runOnUiThread(() -> {
            Toast.makeText(getContext(), "Bridge Check Received", Toast.LENGTH_SHORT).show();
        });

        boolean isEnabled = isAccessibilityServiceEnabled(getContext(), ShortsBlockerService.class);
        
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean isBlockingActive = prefs.getBoolean(KEY_ENABLED, true);

        JSObject ret = new JSObject();
        ret.put("enabled", isEnabled);
        ret.put("blockingActive", isBlockingActive);
        call.resolve(ret);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void setBlockingEnabled(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", true);
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean(KEY_ENABLED, enabled).apply();
        call.resolve();
    }

    private boolean isAccessibilityServiceEnabled(Context context, Class<?> service) {
        String prefString = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (prefString != null) {
            TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
            splitter.setString(prefString);
            while (splitter.hasNext()) {
                String accessibilityService = splitter.next();
                if (accessibilityService.equalsIgnoreCase(context.getPackageName() + "/" + service.getName()) ||
                    accessibilityService.equalsIgnoreCase(context.getPackageName() + "/.ShortsBlockerService") ||
                    accessibilityService.contains(service.getSimpleName())) {
                    return true;
                }
            }
        }
        return false;
    }
}
