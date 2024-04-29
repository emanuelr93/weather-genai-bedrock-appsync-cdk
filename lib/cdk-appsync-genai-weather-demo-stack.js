"use strict";
// @ts-ignore
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkAppsyncGenAIWeatherDemoStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_appsync_1 = require("aws-cdk-lib/aws-appsync");
const path = require("path");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class CdkAppsyncGenAIWeatherDemoStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const api = new aws_appsync_1.GraphqlApi(this, 'WeatherApi', {
            name: 'weather-api',
            definition: aws_appsync_1.Definition.fromFile(path.join(__dirname, '../graphql/schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: aws_appsync_1.AuthorizationType.API_KEY,
                },
            },
            logConfig: { fieldLogLevel: aws_appsync_1.FieldLogLevel.ALL },
            xrayEnabled: true,
        });
        const bedrockDataSource = api.addHttpDataSource('bedrockDS', 'https://bedrock-runtime.us-east-1.amazonaws.com', {
            authorizationConfig: {
                signingRegion: 'us-east-1',
                signingServiceName: 'bedrock',
            },
        });
        bedrockDataSource.grantPrincipal.addToPrincipalPolicy(new aws_iam_1.PolicyStatement({
            resources: [
                'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
            ],
            actions: ['bedrock:InvokeModel'],
        }));
        const getGenAI = new aws_appsync_1.AppsyncFunction(this, 'GetGenAI', {
            name: 'getGenAi',
            api,
            dataSource: bedrockDataSource,
            code: aws_appsync_1.Code.fromAsset(path.join(__dirname, '../resolvers/getGenAI.js')),
            runtime: aws_appsync_1.FunctionRuntime.JS_1_0_0,
        });
        const weatherDataSource = new aws_appsync_1.HttpDataSource(this, "WeatherHTTPDS", {
            api: api,
            name: "OpenWeatherApiDataSource",
            endpoint: "https://api.open-meteo.com/",
        });
        const getWeather = new aws_appsync_1.AppsyncFunction(this, 'GetWeather', {
            name: 'getWeather',
            api,
            dataSource: weatherDataSource,
            code: aws_appsync_1.Code.fromAsset(path.join(__dirname, '../resolvers/getWeather.js')),
            runtime: aws_appsync_1.FunctionRuntime.JS_1_0_0,
        });
        new aws_appsync_1.Resolver(this, 'PipelineResolverGetWeather', {
            api,
            typeName: 'Query',
            fieldName: 'getWeather',
            runtime: aws_appsync_1.FunctionRuntime.JS_1_0_0,
            code: aws_appsync_1.Code.fromAsset(path.join(__dirname, '../resolvers/pipeline.js')),
            pipelineConfig: [getWeather, getGenAI],
        });
    }
}
exports.CdkAppsyncGenAIWeatherDemoStack = CdkAppsyncGenAIWeatherDemoStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWFwcHN5bmMtZ2VuYWktd2VhdGhlci1kZW1vLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWFwcHN5bmMtZ2VuYWktd2VhdGhlci1kZW1vLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxhQUFhOzs7QUFFYixtQ0FBbUM7QUFDbkMseURBU2lDO0FBRWpDLDZCQUE4QjtBQUM5QixpREFBb0Q7QUFFcEQsTUFBYSwrQkFBZ0MsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM1RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sR0FBRyxHQUFHLElBQUksd0JBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzdDLElBQUksRUFBRSxhQUFhO1lBQ25CLFVBQVUsRUFBRSx3QkFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBQ2xGLG1CQUFtQixFQUFFO2dCQUNuQixvQkFBb0IsRUFBRTtvQkFDcEIsaUJBQWlCLEVBQUUsK0JBQWlCLENBQUMsT0FBTztpQkFDN0M7YUFDRjtZQUNELFNBQVMsRUFBRSxFQUFDLGFBQWEsRUFBRSwyQkFBYSxDQUFDLEdBQUcsRUFBQztZQUM3QyxXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7UUFFSCxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FDM0MsV0FBVyxFQUNYLGlEQUFpRCxFQUNqRDtZQUNFLG1CQUFtQixFQUFFO2dCQUNuQixhQUFhLEVBQUUsV0FBVztnQkFDMUIsa0JBQWtCLEVBQUUsU0FBUzthQUM5QjtTQUNGLENBQ0osQ0FBQztRQUVGLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FDakQsSUFBSSx5QkFBZSxDQUFDO1lBQ2xCLFNBQVMsRUFBRTtnQkFDVCxxRkFBcUY7YUFDdEY7WUFDRCxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztTQUNqQyxDQUFDLENBQ0wsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLElBQUksNkJBQWUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ3JELElBQUksRUFBRSxVQUFVO1lBQ2hCLEdBQUc7WUFDSCxVQUFVLEVBQUUsaUJBQWlCO1lBQzdCLElBQUksRUFBRSxrQkFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sRUFBRSw2QkFBZSxDQUFDLFFBQVE7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLDRCQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNsRSxHQUFHLEVBQUUsR0FBRztZQUNSLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsUUFBUSxFQUFFLDZCQUE2QjtTQUN4QyxDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLDZCQUFlLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN6RCxJQUFJLEVBQUUsWUFBWTtZQUNsQixHQUFHO1lBQ0gsVUFBVSxFQUFFLGlCQUFpQjtZQUM3QixJQUFJLEVBQUUsa0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUN4RSxPQUFPLEVBQUUsNkJBQWUsQ0FBQyxRQUFRO1NBQ2xDLENBQUMsQ0FBQztRQUVILElBQUksc0JBQVEsQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDL0MsR0FBRztZQUNILFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLE9BQU8sRUFBRSw2QkFBZSxDQUFDLFFBQVE7WUFDakMsSUFBSSxFQUFFLGtCQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLENBQUM7WUFDdEUsY0FBYyxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQztTQUN2QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFuRUQsMEVBbUVDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHtcbiAgQXBwc3luY0Z1bmN0aW9uLFxuICBBdXRob3JpemF0aW9uVHlwZSxcbiAgQ29kZSxcbiAgRGVmaW5pdGlvbiwgRmllbGRMb2dMZXZlbCxcbiAgRnVuY3Rpb25SdW50aW1lLFxuICBHcmFwaHFsQXBpLFxuICBIdHRwRGF0YVNvdXJjZSxcbiAgUmVzb2x2ZXJcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwcHN5bmMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCB7UG9saWN5U3RhdGVtZW50fSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuXG5leHBvcnQgY2xhc3MgQ2RrQXBwc3luY0dlbkFJV2VhdGhlckRlbW9TdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBHcmFwaHFsQXBpKHRoaXMsICdXZWF0aGVyQXBpJywge1xuICAgICAgbmFtZTogJ3dlYXRoZXItYXBpJyxcbiAgICAgIGRlZmluaXRpb246IERlZmluaXRpb24uZnJvbUZpbGUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2dyYXBocWwvc2NoZW1hLmdyYXBocWwnKSksXG4gICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgIGRlZmF1bHRBdXRob3JpemF0aW9uOiB7XG4gICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IEF1dGhvcml6YXRpb25UeXBlLkFQSV9LRVksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgbG9nQ29uZmlnOiB7ZmllbGRMb2dMZXZlbDogRmllbGRMb2dMZXZlbC5BTEx9LFxuICAgICAgeHJheUVuYWJsZWQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBiZWRyb2NrRGF0YVNvdXJjZSA9IGFwaS5hZGRIdHRwRGF0YVNvdXJjZShcbiAgICAgICAgJ2JlZHJvY2tEUycsXG4gICAgICAgICdodHRwczovL2JlZHJvY2stcnVudGltZS51cy1lYXN0LTEuYW1hem9uYXdzLmNvbScsXG4gICAgICAgIHtcbiAgICAgICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgICAgICBzaWduaW5nUmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICAgICAgICAgIHNpZ25pbmdTZXJ2aWNlTmFtZTogJ2JlZHJvY2snLFxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgYmVkcm9ja0RhdGFTb3VyY2UuZ3JhbnRQcmluY2lwYWwuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgICAgJ2Fybjphd3M6YmVkcm9jazp1cy1lYXN0LTE6OmZvdW5kYXRpb24tbW9kZWwvYW50aHJvcGljLmNsYXVkZS0zLXNvbm5ldC0yMDI0MDIyOS12MTowJyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFjdGlvbnM6IFsnYmVkcm9jazpJbnZva2VNb2RlbCddLFxuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zdCBnZXRHZW5BSSA9IG5ldyBBcHBzeW5jRnVuY3Rpb24odGhpcywgJ0dldEdlbkFJJywge1xuICAgICAgbmFtZTogJ2dldEdlbkFpJyxcbiAgICAgIGFwaSxcbiAgICAgIGRhdGFTb3VyY2U6IGJlZHJvY2tEYXRhU291cmNlLFxuICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3Jlc29sdmVycy9nZXRHZW5BSS5qcycpKSxcbiAgICAgIHJ1bnRpbWU6IEZ1bmN0aW9uUnVudGltZS5KU18xXzBfMCxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdlYXRoZXJEYXRhU291cmNlID0gbmV3IEh0dHBEYXRhU291cmNlKHRoaXMsIFwiV2VhdGhlckhUVFBEU1wiLCB7XG4gICAgICBhcGk6IGFwaSxcbiAgICAgIG5hbWU6IFwiT3BlbldlYXRoZXJBcGlEYXRhU291cmNlXCIsXG4gICAgICBlbmRwb2ludDogXCJodHRwczovL2FwaS5vcGVuLW1ldGVvLmNvbS9cIixcbiAgICB9KTtcblxuICAgIGNvbnN0IGdldFdlYXRoZXIgPSBuZXcgQXBwc3luY0Z1bmN0aW9uKHRoaXMsICdHZXRXZWF0aGVyJywge1xuICAgICAgbmFtZTogJ2dldFdlYXRoZXInLFxuICAgICAgYXBpLFxuICAgICAgZGF0YVNvdXJjZTogd2VhdGhlckRhdGFTb3VyY2UsXG4gICAgICBjb2RlOiBDb2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcmVzb2x2ZXJzL2dldFdlYXRoZXIuanMnKSksXG4gICAgICBydW50aW1lOiBGdW5jdGlvblJ1bnRpbWUuSlNfMV8wXzAsXG4gICAgfSk7XG5cbiAgICBuZXcgUmVzb2x2ZXIodGhpcywgJ1BpcGVsaW5lUmVzb2x2ZXJHZXRXZWF0aGVyJywge1xuICAgICAgYXBpLFxuICAgICAgdHlwZU5hbWU6ICdRdWVyeScsXG4gICAgICBmaWVsZE5hbWU6ICdnZXRXZWF0aGVyJyxcbiAgICAgIHJ1bnRpbWU6IEZ1bmN0aW9uUnVudGltZS5KU18xXzBfMCxcbiAgICAgIGNvZGU6IENvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZXNvbHZlcnMvcGlwZWxpbmUuanMnKSksXG4gICAgICBwaXBlbGluZUNvbmZpZzogW2dldFdlYXRoZXIsIGdldEdlbkFJXSxcbiAgICB9KTtcbiAgfVxufSJdfQ==