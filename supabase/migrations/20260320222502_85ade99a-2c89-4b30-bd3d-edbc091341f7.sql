-- Store service role key in vault so pg_net trigger can use it
SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZmtreGRqb2dra29ibnNlZHlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzcyODYwMywiZXhwIjoyMDg5MzA0NjAzfQ.xhNnLJilEIXzkujs7FwyJ3_-_pXXbOton-1-jFUrNwo',
  'service_role_key',
  'Service role key for pg_net trigger to call process-task-queue'
);