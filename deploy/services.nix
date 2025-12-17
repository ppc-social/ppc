{ pkgs
, instant
, instant_port
, instant_www_port
, zitadel_port
, zitadel_login_port
, dataDir
, ...

}: {
  project.name = "ppc_local_dev_env";
  services = {


    db.service = {
      image = "public.ecr.aws/z9j8u5b3/instant-public:postgresql-16-pg-hint-plan";
      restart = "unless-stopped";
      environment = {
        "POSTGRES_PASSWORD" = "pass";
        "POSTGRES_USER" = "admin";
        "POSTGRES_DB" = "instant";
      };
      volumes = [
        "${dataDir}/db:/var/lib/postgresql/data"
      ];
      healthcheck = {
        test = ["CMD" "pg_isready" "-U" "instant"];
        interval = "10s";
        timeout = "5s";
        retries = 5;
      };
      command = [
        "postgres"
        "-c"
        "wal_level=logical"
        "-c" "max_replication_slots=4"
        "-c"
        "max_wal_senders=4"
        "-c"
        "shared_preload_libraries=pg_hint_plan"
        "-c"
        "random_page_cost=1.1"
      ];
    };

    instant.service = {
      depends_on = [ "db" ];
      restart = "unless-stopped";
      build.context = "${instant}/server";
      build.dockerfile = "Dockerfile-dev";
      environment = {
        DATABASE_URL = "postgresql://admin:pass@db:5432/instant";
        NREPL_BIND_ADDRESS = "0.0.0.0";
        SERVER_ORIGIN= "http://localhost:${builtins.toString instant_port}";
      };
      volumes = [
        "${dataDir}/instant/src/server:/app"
      ];
      ports = [
        "${builtins.toString instant_port}:8888"
      ];
    };

    instant-www.service = {
      depends_on = [ "db" "instant" ];
      restart = "unless-stopped";
      build.context = "${./.}";
      build.dockerfile = "Dockerfile-instant-client";
      environment = {
        DASHBOARD_ORIGIN = "http://localhost:${builtins.toString instant_www_port}";
      };
      volumes = [
        "${dataDir}/instant/src/server:/app"
      ];
      ports = [
        "${builtins.toString instant_www_port}:8888"
      ];
    };

    # based on: https://raw.githubusercontent.com/zitadel/zitadel/main/docs/docs/self-hosting/deploy/docker-compose.yaml
    # as mentrioned here: https://zitadel.com/docs/self-hosting/deploy/compose
    zitadel.service = {
      image = "ghcr.io/zitadel/zitadel:latest";
      restart = "unless-stopped";
      command = "start-from-init --masterkey MasterkeyNeedsToHave32Characters";
      user = "0";
      volumes = [
        "${dataDir}/zitadel:/zitadel_dir:rw"
      ];
      environment = {
        ZITADEL_EXTERNALDOMAIN = "localhost";
        ZITADEL_EXTERNALSECURE = "false";
        ZITADEL_TLS_ENABLED = "false";
        ZITADEL_LOG_LEVEL = "debug";
        ZITADEL_LOGSTORE_ACCESS_STDOUT_ENABLED = "true";
        ZITADEL_PORT = "${builtins.toString zitadel_port}";

        ZITADEL_DATABASE_POSTGRES_HOST = "db";
        ZITADEL_DATABASE_POSTGRES_PORT = 5432;
        ZITADEL_DATABASE_POSTGRES_DATABASE = "zitadel";
        ZITADEL_DATABASE_POSTGRES_ADMIN_USERNAME = "admin";
        ZITADEL_DATABASE_POSTGRES_ADMIN_PASSWORD = "pass";
        ZITADEL_DATABASE_POSTGRES_ADMIN_SSL_MODE = "disable";
        ZITADEL_DATABASE_POSTGRES_USER_USERNAME = "zitadel";
        ZITADEL_DATABASE_POSTGRES_USER_PASSWORD = "pass";
        ZITADEL_DATABASE_POSTGRES_USER_SSL_MODE = "disable";
        
        ZITADEL_FIRSTINSTANCE_LOGINCLIENTPATPATH = "/zitadel_dir/login-client.pat";
        ZITADEL_FIRSTINSTANCE_ORG_HUMAN_PASSWORDCHANGEREQUIRED = "false";
        ZITADEL_FIRSTINSTANCE_ORG_LOGINCLIENT_MACHINE_USERNAME = "login-client";
        ZITADEL_FIRSTINSTANCE_ORG_LOGINCLIENT_MACHINE_NAME = "Automatically Initialized IAM_LOGIN_CLIENT";
        ZITADEL_FIRSTINSTANCE_ORG_LOGINCLIENT_PAT_EXPIRATIONDATE = "2529-01-01T00:00:00Z";

        ZITADEL_DEFAULTINSTANCE_FEATURES_LOGINV2_REQUIRED = "true";
        ZITADEL_DEFAULTINSTANCE_FEATURES_LOGINV2_BASEURI = "http://localhost:${builtins.toString zitadel_login_port}/ui/v2/login";

        ZITADEL_OIDC_DEFAULTLOGINURLV2 = "http://localhost:${builtins.toString zitadel_login_port}/ui/v2/login/login?authRequest=";
        ZITADEL_OIDC_DEFAULTLOGOUTURLV2 = "http://localhost:${builtins.toString zitadel_login_port}/ui/v2/login/logout?post_logout_redirect=";
        ZITADEL_SAML_DEFAULTLOGINURLV2 = "http://localhost:${builtins.toString zitadel_login_port}/ui/v2/login/login?samlRequest=";

        # By configuring a machine, the setup job creates a user of type machine with the role IAM_OWNER.
        # It writes a personal access token (PAT) to the path specified in ZITADEL_FIRSTINSTANCE_PATPATH.
        # The PAT can be used to provision resources with [Terraform](/docs/guides/manage/terraform-provider), for example.
        ZITADEL_FIRSTINSTANCE_PATPATH = "/zitadel_dir/admin.pat";
        ZITADEL_FIRSTINSTANCE_ORG_MACHINE_MACHINE_USERNAME = "admin";
        ZITADEL_FIRSTINSTANCE_ORG_MACHINE_MACHINE_NAME = "Automatically Initialized IAM_OWNER";
        ZITADEL_FIRSTINSTANCE_ORG_MACHINE_PAT_EXPIRATIONDATE = "2529-01-01T00:00:00Z";
        
        # To change the initial human admin users username and password, uncomment the following lines.
        # The first login name is formatted like this: <username>@<org_name>.<external_domain>
        # With the following incommented configuration, this would be root@my-organization.localhost
        # Visit http://localhost:8080/ui/console to check if the login name works.
        # If you can't log in, check the available login names:
        # echo "select * from projections.login_names3;" | psql -h localhost -U postgres -d zitadel
        ZITADEL_FIRSTINSTANCE_ORG_NAME = "ppc";
        ZITADEL_FIRSTINSTANCE_ORG_HUMAN_USERNAME = "root";
        ZITADEL_FIRSTINSTANCE_ORG_HUMAN_PASSWORD = "RootPassword1!";

      };

      ports = [ 
        "${builtins.toString zitadel_port}:${builtins.toString zitadel_port}"

        # the port for the login service (which is in the same network namespace)
        "${builtins.toString zitadel_login_port}:${builtins.toString zitadel_login_port}"
      ];
    };

    zitadel-login.service = {
      image = "ghcr.io/zitadel/zitadel-login:latest";
      restart = "unless-stopped";
      network_mode = "service:zitadel";

      environment = {
        ZITADEL_API_URL = "http://localhost:${builtins.toString zitadel_port}";
        NEXT_PUBLIC_BASE_PATH = "/ui/v2/login";
        ZITADEL_SERVICE_USER_TOKEN_FILE = "/zitadel_dir/login-client.pat";
        PORT = "${builtins.toString zitadel_login_port}";
        #CUSTOM_REQUEST_HEADERS = "Host:localhost:3002";
      };
      volumes = [
        "${dataDir}/zitadel:/zitadel_dir:rw"
      ];
      #ports = [ "${builtins.toString zitadel_login_port}:3000" ];
    };
  };
}













