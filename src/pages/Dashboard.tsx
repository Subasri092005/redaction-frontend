import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Clock, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data.reverse().slice(0, 5));
      } catch (err: any) {
        setError(err.message || 'Error fetching history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalFiles = history.length;
  const avgProcessing = history.length > 0 ? (history.reduce((sum, h) => sum + (h.processing_time || 0), 0) / history.length) : 0;
  const compliance = history.every(h => h.processing_time !== undefined && h.processing_time !== null) ? 'Compliant' : 'Attention Needed';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your document redaction activities</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{totalFiles}</div>
            <div className="text-sm text-muted-foreground">Total Protected Files</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-foreground">{avgProcessing.toFixed(2)}s</div>
            <div className="text-sm text-muted-foreground">Avg Processing Time</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className={`text-2xl font-bold ${compliance === 'Compliant' ? 'text-success' : 'text-destructive'}`}>{compliance}</div>
            <div className="text-sm text-muted-foreground">Compliance Status</div>
          </CardContent>
        </Card>
      </div>
      <a href="/upload">
        <Button className="fixed bottom-8 right-8 z-50 bg-gradient-primary shadow-lg rounded-full h-16 w-16 p-0 flex items-center justify-center text-white text-lg hover:scale-105 transition-transform">
          <FileText className="h-7 w-7" />
        </Button>
      </a>
      <Card className="border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : history.length === 0 ? (
              <div>No recent activity found.</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.file}</p>
                      <p className="text-xs text-muted-foreground">Redacted • {item.timestamp ? item.timestamp.replace('T', ' ').split('.')[0] : '-'}</p>
                    </div>
                  </div>
                  <a href={`${import.meta.env.VITE_API_URL}/preview/${item.id}?type=redacted`} target="_blank" rel="noopener noreferrer">
                    <Badge variant="default">View</Badge>
                  </a>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;