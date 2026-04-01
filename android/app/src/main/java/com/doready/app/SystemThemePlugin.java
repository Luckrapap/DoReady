package com.doready.app;

import android.content.res.Configuration;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemTheme")
public class SystemThemePlugin extends Plugin {
    @PluginMethod
    public void getTheme(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", getCurrentTheme());
        call.resolve(ret);
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
        notifyListeners("systemThemeChange", ret);
    }
}
