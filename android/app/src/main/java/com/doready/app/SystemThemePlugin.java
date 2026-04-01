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
        int nightModeFlags = getContext().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        
        switch (nightModeFlags) {
            case Configuration.UI_MODE_NIGHT_YES:
                ret.put("value", "dark");
                break;
            case Configuration.UI_MODE_NIGHT_NO:
                ret.put("value", "light");
                break;
            default:
                ret.put("value", "undefined");
                break;
        }
        call.resolve(ret);
    }
}
