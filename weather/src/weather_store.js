export default { 
  namespace : "weather",
  state     : {
    api_key       : process.env.VUE_APP_WEATHER_API_KEY
  },
  bindings  : {
    city_one_weather : {
      endpoint  : "current_weather", 
      bind      : "watch",
      period    : 60000,
      param_map : {
        city_one_name : "q",
        api_key : "appid",
      },
      create_params : true,
    },

    city_two_weather : {
      endpoint  : "current_weather", 
      bind      : "watch",
      period    : 60000,
      param_map : {
        city_two_name : "q",
        api_key : "appid",
      },
      create_params : true,
    },
  }
}
