
import "./style.css"

export default function McSite() {
  return (
    <>
      <div className="main flex">
        <div className="card title">
          <div>Welcome to the</div>
          <div className="strong">PeopleCorner</div>
          <div>Minecraft Cluster</div>
        </div>
        <div className="card info flex">
          <div className="sub-card">
            <span className="card-heading">Address</span>
            <span className="card-body">mc.ppc.social</span>
            <span className="card-footer">Java 1.21.4 and Bedrock</span>
          </div>
          <div className="sub-card">
            <span className="card-heading">Discord</span>
            <a className="card-body" href="https://discord.gg/cMKQNJMkRe" target="_blank">https://discord.gg/cMKQNJMkRe</a>
            <span className="card-footer">come and say hi!</span>
          </div>
          <div className="semi mt">
            To go to the current main server use the portal with the sign "first"....
            See you ingame and bring your friends!!
          </div>
        </div>
        <div className="card">
          <span className="card-heading strong">SimpleVoicechat</span>
          <span className="card-body">
            This is <span className="semi">not required</span>, but makes playing soooo much more fun, so it's
            <span className="semi">highly encouraged</span>.
            <br/><br/>
            <span className="semi">Instructions can be found here</span>:<br/>
            <a href="https://fabricmc.net/use/installer/" className="link ml">Fabric</a>
            <br/>
            <a className="link ml" href="https://modrepo.de/minecraft/voicechat/wiki/installation#fabric">SimpleVoiceChat</a>
            <br/><br/>
            If you play on
            <span className="semi">bedrock</span>
            or simply
            <span className="semi">don't want to mod</span>
            your game, <span className="semi">we provide discord channels</span>
            that connect to in-game "groups".<br/>
            They are identified by their server name (like "first", "public" and such) followed by a number (e.g. "First 01")
          </span>
        </div>
      </div>
    </>
  );
}
