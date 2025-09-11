import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RedactionHistory = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistoryData(data.reverse());
      } catch (err: any) {
        setError(err.message || 'Error fetching history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRedactionLevelColor = (level: string) => {
    switch (level) {
      case 'Full PII':
        return 'text-destructive';
      case 'Partial PII':
        return 'text-warning';
      case 'Custom':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const filteredData = historyData.filter((item) => {
    const matchesSearch = item.file.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Redaction History</h1>
        <p className="text-muted-foreground">View and manage all your document redaction activities</p>
      </div>
      <Card className="border-border shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : filteredData.length === 0 ? (
              <div>No history found.</div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-3 bg-muted/50 rounded-lg items-center">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{item.file}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">ID: {item.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">-</div>
                    <div className="text-xs text-muted-foreground">-</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{item.timestamp ? item.timestamp.split('T')[0] : '-'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.timestamp ? item.timestamp.split('T')[1]?.split('.')[0] : '-'}</div>
                  </div>
                  <div className="flex justify-center lg:justify-start">
                    {getStatusBadge('completed')}
                  </div>
                  <div className="flex space-x-2">
                    <a href={`${import.meta.env.VITE_API_URL}/preview/${item.id}?type=redacted`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href={`${import.meta.env.VITE_API_URL}/download/${item.id}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
            <div className="text-sm text-muted-foreground">Total Processed</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{filteredData.filter(item => item.status === 'completed').length}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-destructive">{filteredData.filter(item => item.status === 'failed').length}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredData.length > 0 ? (filteredData.reduce((sum, h) => sum + (h.processing_time || 0), 0) / filteredData.length).toFixed(2) : '0.00'}s</div>
            <div className="text-sm text-muted-foreground">Avg. Processing</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RedactionHistory;