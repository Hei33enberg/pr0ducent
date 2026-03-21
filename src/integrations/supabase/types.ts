export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          ai_model_used: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          language: string | null
          og_image_url: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_model_used?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          language?: string | null
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_model_used?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          language?: string | null
          og_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      broker_account_leases: {
        Row: {
          expires_at: string
          id: string
          leased_at: string
          pool_account_id: string
          released_at: string | null
          run_task_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          leased_at?: string
          pool_account_id: string
          released_at?: string | null
          run_task_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          leased_at?: string
          pool_account_id?: string
          released_at?: string | null
          run_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_account_leases_pool_account_id_fkey"
            columns: ["pool_account_id"]
            isOneToOne: false
            referencedRelation: "broker_pool_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_account_leases_run_task_id_fkey"
            columns: ["run_task_id"]
            isOneToOne: false
            referencedRelation: "run_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_pool_accounts: {
        Row: {
          created_at: string
          health_score: number
          id: string
          label: string
          status: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          health_score?: number
          id?: string
          label?: string
          status?: string
          tool_id: string
        }
        Update: {
          created_at?: string
          health_score?: number
          id?: string
          label?: string
          status?: string
          tool_id?: string
        }
        Relationships: []
      }
      builder_arena_votes: {
        Row: {
          created_at: string
          experiment_id: string
          id: string
          tool_a_id: string
          tool_b_id: string
          user_id: string | null
          winner_tool_id: string | null
        }
        Insert: {
          created_at?: string
          experiment_id: string
          id?: string
          tool_a_id: string
          tool_b_id: string
          user_id?: string | null
          winner_tool_id?: string | null
        }
        Update: {
          created_at?: string
          experiment_id?: string
          id?: string
          tool_a_id?: string
          tool_b_id?: string
          user_id?: string | null
          winner_tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_arena_votes_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_benchmark_scores: {
        Row: {
          ai_reasoning: Json | null
          builder_result_id: string
          experiment_id: string
          id: string
          pvi_score: number | null
          score_accessibility: number | null
          score_code_quality: number | null
          score_completeness: number | null
          score_cost_efficiency: number | null
          score_deploy_readiness: number | null
          score_mobile_responsiveness: number | null
          score_reliability: number | null
          score_speed: number | null
          score_ui_quality: number | null
          score_web_vitals: number | null
          scored_at: string
          scoring_model: string | null
          tool_id: string
        }
        Insert: {
          ai_reasoning?: Json | null
          builder_result_id: string
          experiment_id: string
          id?: string
          pvi_score?: number | null
          score_accessibility?: number | null
          score_code_quality?: number | null
          score_completeness?: number | null
          score_cost_efficiency?: number | null
          score_deploy_readiness?: number | null
          score_mobile_responsiveness?: number | null
          score_reliability?: number | null
          score_speed?: number | null
          score_ui_quality?: number | null
          score_web_vitals?: number | null
          scored_at?: string
          scoring_model?: string | null
          tool_id: string
        }
        Update: {
          ai_reasoning?: Json | null
          builder_result_id?: string
          experiment_id?: string
          id?: string
          pvi_score?: number | null
          score_accessibility?: number | null
          score_code_quality?: number | null
          score_completeness?: number | null
          score_cost_efficiency?: number | null
          score_deploy_readiness?: number | null
          score_mobile_responsiveness?: number | null
          score_reliability?: number | null
          score_speed?: number | null
          score_ui_quality?: number | null
          score_web_vitals?: number | null
          scored_at?: string
          scoring_model?: string | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_benchmark_scores_builder_result_id_fkey"
            columns: ["builder_result_id"]
            isOneToOne: true
            referencedRelation: "builder_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_benchmark_scores_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_crawl_sources: {
        Row: {
          crawl_frequency_hours: number
          created_at: string
          enabled: boolean
          id: string
          last_crawled_at: string | null
          source_type: string
          source_url: string
          tool_id: string
        }
        Insert: {
          crawl_frequency_hours?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_crawled_at?: string | null
          source_type?: string
          source_url: string
          tool_id: string
        }
        Update: {
          crawl_frequency_hours?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_crawled_at?: string | null
          source_type?: string
          source_url?: string
          tool_id?: string
        }
        Relationships: []
      }
      builder_ingest_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          payload: Json
          tool_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          payload?: Json
          tool_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          payload?: Json
          tool_id?: string
        }
        Relationships: []
      }
      builder_integration_config: {
        Row: {
          api_secret_env: string | null
          browserbase_script: string | null
          capabilities: Json
          circuit_state: string
          config_validation_errors: Json
          display_name: string | null
          enabled: boolean
          execution_modes: string[]
          last_config_validation_at: string | null
          last_heartbeat: string | null
          max_poll_time_ms: number
          mcp_endpoint: string | null
          poll_interval_ms: number
          polling_function: string | null
          tier: number
          tool_id: string
          updated_at: string
        }
        Insert: {
          api_secret_env?: string | null
          browserbase_script?: string | null
          capabilities?: Json
          circuit_state?: string
          config_validation_errors?: Json
          display_name?: string | null
          enabled?: boolean
          execution_modes?: string[]
          last_config_validation_at?: string | null
          last_heartbeat?: string | null
          max_poll_time_ms?: number
          mcp_endpoint?: string | null
          poll_interval_ms?: number
          polling_function?: string | null
          tier?: number
          tool_id: string
          updated_at?: string
        }
        Update: {
          api_secret_env?: string | null
          browserbase_script?: string | null
          capabilities?: Json
          circuit_state?: string
          config_validation_errors?: Json
          display_name?: string | null
          enabled?: boolean
          execution_modes?: string[]
          last_config_validation_at?: string | null
          last_heartbeat?: string | null
          max_poll_time_ms?: number
          mcp_endpoint?: string | null
          poll_interval_ms?: number
          polling_function?: string | null
          tier?: number
          tool_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      builder_knowledge_chunks: {
        Row: {
          checksum: string | null
          content: string
          content_type: string
          crawled_at: string
          id: string
          metadata: Json | null
          source_url: string
          tool_id: string
        }
        Insert: {
          checksum?: string | null
          content: string
          content_type: string
          crawled_at?: string
          id?: string
          metadata?: Json | null
          source_url: string
          tool_id: string
        }
        Update: {
          checksum?: string | null
          content?: string
          content_type?: string
          crawled_at?: string
          id?: string
          metadata?: Json | null
          source_url?: string
          tool_id?: string
        }
        Relationships: []
      }
      builder_price_history: {
        Row: {
          annual_price: number | null
          credits_included: number | null
          id: string
          monthly_price: number | null
          plan_name: string
          recorded_at: string | null
          tool_id: string
        }
        Insert: {
          annual_price?: number | null
          credits_included?: number | null
          id?: string
          monthly_price?: number | null
          plan_name: string
          recorded_at?: string | null
          tool_id: string
        }
        Update: {
          annual_price?: number | null
          credits_included?: number | null
          id?: string
          monthly_price?: number | null
          plan_name?: string
          recorded_at?: string | null
          tool_id?: string
        }
        Relationships: []
      }
      builder_pricing_plans: {
        Row: {
          ai_models: string[] | null
          annual_price: number | null
          created_at: string | null
          credit_unit: string | null
          credits_included: number | null
          dev_environment: string | null
          features: Json | null
          id: string
          languages_supported: string[] | null
          monthly_price: number | null
          overage_cost: number | null
          plan_name: string
          promo_active: boolean | null
          promo_description: string | null
          promo_expires_at: string | null
          tool_id: string
          updated_at: string | null
        }
        Insert: {
          ai_models?: string[] | null
          annual_price?: number | null
          created_at?: string | null
          credit_unit?: string | null
          credits_included?: number | null
          dev_environment?: string | null
          features?: Json | null
          id?: string
          languages_supported?: string[] | null
          monthly_price?: number | null
          overage_cost?: number | null
          plan_name: string
          promo_active?: boolean | null
          promo_description?: string | null
          promo_expires_at?: string | null
          tool_id: string
          updated_at?: string | null
        }
        Update: {
          ai_models?: string[] | null
          annual_price?: number | null
          created_at?: string | null
          credit_unit?: string | null
          credits_included?: number | null
          dev_environment?: string | null
          features?: Json | null
          id?: string
          languages_supported?: string[] | null
          monthly_price?: number | null
          overage_cost?: number | null
          plan_name?: string
          promo_active?: boolean | null
          promo_description?: string | null
          promo_expires_at?: string | null
          tool_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      builder_rate_limits: {
        Row: {
          circuit_state: string
          max_concurrent: number
          max_per_minute: number
          requests_in_window: number
          tool_id: string
          updated_at: string
          window_started_at: string
        }
        Insert: {
          circuit_state?: string
          max_concurrent?: number
          max_per_minute?: number
          requests_in_window?: number
          tool_id: string
          updated_at?: string
          window_started_at?: string
        }
        Update: {
          circuit_state?: string
          max_concurrent?: number
          max_per_minute?: number
          requests_in_window?: number
          tool_id?: string
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      builder_ratings: {
        Row: {
          created_at: string | null
          experiment_id: string | null
          id: string
          rating: number
          review: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experiment_id?: string | null
          id?: string
          rating: number
          review?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          experiment_id?: string | null
          id?: string
          rating?: number
          review?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_results: {
        Row: {
          adapter_tier: number | null
          chat_url: string | null
          created_at: string
          error_message: string | null
          execution_mode: string
          experiment_id: string
          files: Json | null
          generation_time_ms: number | null
          id: string
          preview_url: string | null
          provenance: string
          provider_run_id: string | null
          raw_response: Json | null
          run_task_id: string | null
          scores_reasoning: Json | null
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          adapter_tier?: number | null
          chat_url?: string | null
          created_at?: string
          error_message?: string | null
          execution_mode?: string
          experiment_id: string
          files?: Json | null
          generation_time_ms?: number | null
          id?: string
          preview_url?: string | null
          provenance?: string
          provider_run_id?: string | null
          raw_response?: Json | null
          run_task_id?: string | null
          scores_reasoning?: Json | null
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          adapter_tier?: number | null
          chat_url?: string | null
          created_at?: string
          error_message?: string | null
          execution_mode?: string
          experiment_id?: string
          files?: Json | null
          generation_time_ms?: number | null
          id?: string
          preview_url?: string | null
          provenance?: string
          provider_run_id?: string | null
          raw_response?: Json | null
          run_task_id?: string | null
          scores_reasoning?: Json | null
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_results_run_task_id_fkey"
            columns: ["run_task_id"]
            isOneToOne: false
            referencedRelation: "run_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_sync_data: {
        Row: {
          changelog: Json | null
          created_at: string | null
          docs_url: string | null
          features: Json | null
          id: string
          last_synced_at: string | null
          official_url: string | null
          pricing_tiers: Json | null
          raw_perplexity_response: Json | null
          status: string | null
          tool_id: string
          updated_at: string | null
        }
        Insert: {
          changelog?: Json | null
          created_at?: string | null
          docs_url?: string | null
          features?: Json | null
          id?: string
          last_synced_at?: string | null
          official_url?: string | null
          pricing_tiers?: Json | null
          raw_perplexity_response?: Json | null
          status?: string | null
          tool_id: string
          updated_at?: string | null
        }
        Update: {
          changelog?: Json | null
          created_at?: string | null
          docs_url?: string | null
          features?: Json | null
          id?: string
          last_synced_at?: string | null
          official_url?: string | null
          pricing_tiers?: Json | null
          raw_perplexity_response?: Json | null
          status?: string | null
          tool_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          experiment_id: string | null
          id: string
          metadata: Json | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_runs: {
        Row: {
          completed_at: string | null
          cons: Json
          description: string
          experiment_id: string
          id: string
          pros: Json
          scores: Json
          scores_reasoning: Json | null
          started_at: string
          status: string
          time_to_prototype: number | null
          tool_id: string
        }
        Insert: {
          completed_at?: string | null
          cons?: Json
          description?: string
          experiment_id: string
          id?: string
          pros?: Json
          scores?: Json
          scores_reasoning?: Json | null
          started_at?: string
          status?: string
          time_to_prototype?: number | null
          tool_id: string
        }
        Update: {
          completed_at?: string | null
          cons?: Json
          description?: string
          experiment_id?: string
          id?: string
          pros?: Json
          scores?: Json
          scores_reasoning?: Json | null
          started_at?: string
          status?: string
          time_to_prototype?: number | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_runs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          account_model: string
          created_at: string
          id: string
          is_free_run: boolean | null
          is_public: boolean
          prompt: string
          selected_tools: string[]
          session_id: string | null
          updated_at: string
          use_case_tags: string[]
          user_id: string
        }
        Insert: {
          account_model?: string
          created_at?: string
          id?: string
          is_free_run?: boolean | null
          is_public?: boolean
          prompt: string
          selected_tools?: string[]
          session_id?: string | null
          updated_at?: string
          use_case_tags?: string[]
          user_id: string
        }
        Update: {
          account_model?: string
          created_at?: string
          id?: string
          is_free_run?: boolean | null
          is_public?: boolean
          prompt?: string
          selected_tools?: string[]
          session_id?: string | null
          updated_at?: string
          use_case_tags?: string[]
          user_id?: string
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          notify_blog: boolean | null
          notify_changelog: boolean | null
          notify_pricing: boolean | null
          tool_ids: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_blog?: boolean | null
          notify_changelog?: boolean | null
          notify_pricing?: boolean | null
          tool_ids?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_blog?: boolean | null
          notify_changelog?: boolean | null
          notify_pricing?: boolean | null
          tool_ids?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          clicked_at: string
          experiment_id: string
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          clicked_at?: string
          experiment_id: string
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          clicked_at?: string
          experiment_id?: string
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          conversion_type: string
          created_at: string
          experiment_id: string
          id: string
          metadata: Json
          tool_id: string
          user_id: string
        }
        Insert: {
          conversion_type?: string
          created_at?: string
          experiment_id: string
          id?: string
          metadata?: Json
          tool_id: string
          user_id: string
        }
        Update: {
          conversion_type?: string
          created_at?: string
          experiment_id?: string
          id?: string
          metadata?: Json
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      run_comments: {
        Row: {
          content: string
          created_at: string | null
          experiment_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          experiment_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          experiment_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      run_events: {
        Row: {
          created_at: string
          event_type: string
          experiment_id: string
          id: string
          payload: Json
          run_job_id: string | null
          run_task_id: string | null
          tool_id: string | null
          trace_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          experiment_id: string
          id?: string
          payload?: Json
          run_job_id?: string | null
          run_task_id?: string | null
          tool_id?: string | null
          trace_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          experiment_id?: string
          id?: string
          payload?: Json
          run_job_id?: string | null
          run_task_id?: string | null
          tool_id?: string | null
          trace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_events_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_events_run_job_id_fkey"
            columns: ["run_job_id"]
            isOneToOne: false
            referencedRelation: "run_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_events_run_task_id_fkey"
            columns: ["run_task_id"]
            isOneToOne: false
            referencedRelation: "run_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      run_jobs: {
        Row: {
          created_at: string
          experiment_id: string
          id: string
          idempotency_key: string | null
          metadata: Json
          status: string
          trace_id: string
          updated_at: string
          user_id: string
          workflow_engine: string
        }
        Insert: {
          created_at?: string
          experiment_id: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          status?: string
          trace_id: string
          updated_at?: string
          user_id: string
          workflow_engine?: string
        }
        Update: {
          created_at?: string
          experiment_id?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          status?: string
          trace_id?: string
          updated_at?: string
          user_id?: string
          workflow_engine?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_jobs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      run_tasks: {
        Row: {
          adapter_tier: number | null
          attempt_count: number
          broker_lease_id: string | null
          created_at: string
          error_message: string | null
          experiment_id: string
          id: string
          metadata: Json
          next_retry_at: string | null
          run_job_id: string
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          adapter_tier?: number | null
          attempt_count?: number
          broker_lease_id?: string | null
          created_at?: string
          error_message?: string | null
          experiment_id: string
          id?: string
          metadata?: Json
          next_retry_at?: string | null
          run_job_id: string
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          adapter_tier?: number | null
          attempt_count?: number
          broker_lease_id?: string | null
          created_at?: string
          error_message?: string | null
          experiment_id?: string
          id?: string
          metadata?: Json
          next_retry_at?: string | null
          run_job_id?: string
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "run_tasks_broker_lease_id_fkey"
            columns: ["broker_lease_id"]
            isOneToOne: false
            referencedRelation: "broker_account_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_tasks_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_tasks_run_job_id_fkey"
            columns: ["run_job_id"]
            isOneToOne: false
            referencedRelation: "run_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          prompts_limit: number | null
          prompts_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          prompts_limit?: number | null
          prompts_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          prompts_limit?: number | null
          prompts_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_builder_credentials: {
        Row: {
          created_at: string
          credential_type: string
          id: string
          tool_id: string
          updated_at: string
          user_id: string
          vault_ref: string
        }
        Insert: {
          created_at?: string
          credential_type: string
          id?: string
          tool_id: string
          updated_at?: string
          user_id: string
          vault_ref: string
        }
        Update: {
          created_at?: string
          credential_type?: string
          id?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
          vault_ref?: string
        }
        Relationships: []
      }
      user_comments: {
        Row: {
          body: string
          builder_result_id: string
          created_at: string
          id: string
          sentiment: string | null
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          builder_result_id: string
          created_at?: string
          id?: string
          sentiment?: string | null
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          builder_result_id?: string
          created_at?: string
          id?: string
          sentiment?: string | null
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_comments_builder_result_id_fkey"
            columns: ["builder_result_id"]
            isOneToOne: false
            referencedRelation: "builder_results"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          link: string | null
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_votes: {
        Row: {
          builder_result_id: string
          created_at: string
          id: string
          rating: number | null
          tool_id: string
          user_id: string
          vote: number
          vote_kind: string
        }
        Insert: {
          builder_result_id: string
          created_at?: string
          id?: string
          rating?: number | null
          tool_id: string
          user_id: string
          vote: number
          vote_kind?: string
        }
        Update: {
          builder_result_id?: string
          created_at?: string
          id?: string
          rating?: number | null
          tool_id?: string
          user_id?: string
          vote?: number
          vote_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_builder_result_id_fkey"
            columns: ["builder_result_id"]
            isOneToOne: false
            referencedRelation: "builder_results"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      builder_leaderboard: {
        Row: {
          avg_pvi: number | null
          best_pvi: number | null
          last_scored_at: string | null
          runs_with_preview: number | null
          tool_id: string | null
          total_runs: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      builder_try_dispatch_slot: { Args: { p_tool_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_builder_integration_config: {
        Args: { p_tool_id: string }
        Returns: Json
      }
      validate_builder_integration_config_row: {
        Args: {
          r: Database["public"]["Tables"]["builder_integration_config"]["Row"]
        }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
