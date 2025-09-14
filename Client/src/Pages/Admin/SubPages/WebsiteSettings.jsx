'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Globe,
  Hotel,
  RefreshCw,
  Save,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getWebsiteSettings,
  updateWebsiteSettings,
} from '../../../Api/websiteSettings.api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';

export default function WebsiteSettings() {
  const [settings, setSettings] = useState({
    shopEnabled: true,
    hotelsEnabled: true,
    maintenanceMode: false,
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getWebsiteSettings();
      const settingsData = response.data;

      setSettings({
        shopEnabled: settingsData.shopEnabled,
        hotelsEnabled: settingsData.hotelsEnabled,
        maintenanceMode: settingsData.maintenanceMode,
      });
      setOriginalSettings({
        shopEnabled: settingsData.shopEnabled,
        hotelsEnabled: settingsData.hotelsEnabled,
        maintenanceMode: settingsData.maintenanceMode,
      });
      setLastUpdatedBy(settingsData.lastUpdatedBy);
      setLastUpdated(settingsData.updatedAt);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load website settings');
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateWebsiteSettings(settings);
      setOriginalSettings({ ...settings });
      toast.success('Website settings updated successfully');

      // Refresh settings to get updated metadata
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update website settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original settings
  const handleReset = () => {
    setSettings({ ...originalSettings });
    toast.info('Settings reset to last saved state');
  };

  // Check if settings have changed
  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading website settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Website Settings
          </h1>
          <p className="text-muted-foreground">
            Control the visibility and availability of features across your
            website
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges() || saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges() || saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {/* Feature Toggles Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Feature Visibility</span>
            </CardTitle>
            <CardDescription>
              Control which features are visible and accessible to users
              throughout the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Shop Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                <div className="space-y-1">
                  <Label
                    htmlFor="shop-toggle"
                    className="text-base font-medium"
                  >
                    Shop & Marketplace
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show shop pages, product listings, and shopping cart
                    functionality
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={settings.shopEnabled ? 'default' : 'secondary'}>
                  {settings.shopEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Switch
                  id="shop-toggle"
                  checked={settings.shopEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, shopEnabled: checked }))
                  }
                />
              </div>
            </div>

            {/* Hotels Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Hotel className="h-5 w-5 text-green-500" />
                <div className="space-y-1">
                  <Label
                    htmlFor="hotels-toggle"
                    className="text-base font-medium"
                  >
                    Hotels & Accommodation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show hotel listings, booking options, and accommodation
                    features
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={settings.hotelsEnabled ? 'default' : 'secondary'}
                >
                  {settings.hotelsEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Switch
                  id="hotels-toggle"
                  checked={settings.hotelsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, hotelsEnabled: checked }))
                  }
                />
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>

        {/* Metadata Card */}
        {lastUpdatedBy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">
                    Last Updated By
                  </Label>
                  <p className="font-medium">{lastUpdatedBy?.name}</p>
                  <p className="text-muted-foreground">{lastUpdatedBy.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">
                    {new Date(lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warning Notice */}
      {hasChanges() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-orange-200 bg-orange-50 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <p className="text-sm font-medium text-orange-800">
              You have unsaved changes that will affect the entire website.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
