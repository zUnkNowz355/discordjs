import type { JSONEncodable } from '../util/jsonEncodable';
import type { APIBaseMessageComponent, APIMessageComponent, ComponentType } from 'discord-api-types/v9';

/**
 * Represents a discord component
 */
export abstract class Component<
	DataType extends APIBaseMessageComponent<ComponentType> = APIBaseMessageComponent<ComponentType>,
> implements JSONEncodable<APIMessageComponent>
{
	/**
	 * The api data associated with this component
	 */
	protected data: DataType;

	/**
	 * The type of this component
	 */
	public abstract readonly type: ComponentType;

	/**
	 * Converts this component to an API-compatible JSON object
	 */
	public abstract toJSON(): APIMessageComponent;

	public constructor(data: APIBaseMessageComponent<ComponentType>) {
		this.data = data as DataType;
	}
}
