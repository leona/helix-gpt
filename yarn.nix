{ fetchurl, fetchgit, linkFarm, runCommand, gnutar }: rec {
  offline_cache = linkFarm "offline" packages;
  packages = [
    {
      name = "https___registry.npmjs.org__types_bun___bun_1.0.4.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org__types_bun___bun_1.0.4.tgz";
        url  = "https://registry.npmjs.org/@types/bun/-/bun-1.0.4.tgz";
        sha512 = "2DO7sqwtpko3d3XP2kLpJsOkV12sSRt8cFR955JVB60m1DiXE56T+gJq+DcCczQ5khxgCDQKkyBRlgg5VH33Dw==";
      };
    }
    {
      name = "https___registry.npmjs.org__types_node___node_20.11.5.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org__types_node___node_20.11.5.tgz";
        url  = "https://registry.npmjs.org/@types/node/-/node-20.11.5.tgz";
        sha512 = "g557vgQjUUfN76MZAN/dt1z3dzcUsimuysco0KeluHgrPdJXkP/XdAURgyO2W9fZWHRtRBiVKzKn8vyOAwlG+w==";
      };
    }
    {
      name = "https___registry.npmjs.org__types_ws___ws_8.5.10.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org__types_ws___ws_8.5.10.tgz";
        url  = "https://registry.npmjs.org/@types/ws/-/ws-8.5.10.tgz";
        sha512 = "vmQSUcfalpIq0R9q7uTo2lXs6eGIpt9wtnLdMv9LVpIjCA/+ufZRozlVoVelIYixx1ugCBKDhn89vnsEGOCx9A==";
      };
    }
    {
      name = "https___registry.npmjs.org_bun_types___bun_types_1.0.25.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org_bun_types___bun_types_1.0.25.tgz";
        url  = "https://registry.npmjs.org/bun-types/-/bun-types-1.0.25.tgz";
        sha512 = "9lxeUR/OJsvlZH4GOWteiAdx7ikrSxCUX7Rr0JJux+DrR3LejouVLxIZnTeQ3UPAZovvSgKivWeHPJ2wlo7/Kg==";
      };
    }
    {
      name = "https___registry.npmjs.org_typescript___typescript_5.3.3.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org_typescript___typescript_5.3.3.tgz";
        url  = "https://registry.npmjs.org/typescript/-/typescript-5.3.3.tgz";
        sha512 = "pXWcraxM0uxAS+tN0AG/BF2TyqmHO014Z070UsJ+pFvYuRSq8KH8DmWpnbXe0pEPDHXZV3FcAbJkijJ5oNEnWw==";
      };
    }
    {
      name = "https___registry.npmjs.org_undici_types___undici_types_5.26.5.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org_undici_types___undici_types_5.26.5.tgz";
        url  = "https://registry.npmjs.org/undici-types/-/undici-types-5.26.5.tgz";
        sha512 = "JlCMO+ehdEIKqlFxk6IfVoAUVmgz7cU7zD/h9XZ0qzeosSHmUJVOzSQvvYSYWXkFXC+IfLKSIffhv0sVZup6pA==";
      };
    }
    {
      name = "https___registry.npmjs.org_undici_types___undici_types_5.28.2.tgz";
      path = fetchurl {
        name = "https___registry.npmjs.org_undici_types___undici_types_5.28.2.tgz";
        url  = "https://registry.npmjs.org/undici-types/-/undici-types-5.28.2.tgz";
        sha512 = "W71OLwDqzIO0d3k07qg1xc7d4cX8SsSwuCO4bQ4V7ITwduXXie/lcImofabP5VV+NvuvSe8ovKvHVJcizVc1JA==";
      };
    }
  ];
}
