import IStats from "./IStats";

export default interface IModule {
    channelName: string;
    stats: IStats[];
}
