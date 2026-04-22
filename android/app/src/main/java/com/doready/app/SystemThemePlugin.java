package com.doready.app;

import android.content.res.Configuration;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.graphics.Color;
import android.widget.Toast;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemTheme")
public class SystemThemePlugin extends Plugin {
    @PluginMethod
    public void getTheme(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", getCurrentTheme());
        call.resolve(ret);
    }

    @PluginMethod
    public void setStatusBarTheme(PluginCall call) {
        boolean isDark = call.getBoolean("isDark", true);
        getActivity().runOnUiThread(() -> {
            try {
                // Manage status and navigation bar icons
                WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(getActivity().getWindow(), getActivity().getWindow().getDecorView());
                controller.setAppearanceLightStatusBars(!isDark);
                controller.setAppearanceLightNavigationBars(!isDark);
                
                getActivity().getWindow().setNavigationBarColor(Color.TRANSPARENT);
                
                // Extra protection against system gray overlay (API 29+)
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    getActivity().getWindow().setNavigationBarContrastEnforced(false);
                }
            } catch (Exception e) {}
            call.resolve();
        });
    }

    private String getCurrentTheme() {
        int nightModeFlags = getContext().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        switch (nightModeFlags) {
            case Configuration.UI_MODE_NIGHT_YES:
                return "dark";
            case Configuration.UI_MODE_NIGHT_NO:
                return "light";
            default:
                return "undefined";
        }
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);
        int nightModeFlags = newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK;
        String theme = "undefined";
        if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
            theme = "dark";
        } else if (nightModeFlags == Configuration.UI_MODE_NIGHT_NO) {
            theme = "light";
        }
        
        JSObject ret = new JSObject();
        ret.put("value", theme);
        
        // FINAL DIAGNOSTIC: Show a white bubble on the phone screen
        final String status = "DoReady v5.0 Bridge: " + theme;
        getActivity().runOnUiThread(() -> {
            Toast.makeText(getActivity(), status, Toast.LENGTH_SHORT).show();
        });

        notifyListeners("systemThemeChange", ret);
    }
}
